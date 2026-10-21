import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  mergeItems,
  type OrderItem,
} from '../src/order';

const item = (price: number, qty = 1, sku = 'SKU-1'): OrderItem => ({
  sku,
  price,
  qty,
});

describe('calcSubtotal', () => {
  it('підсумовує вартість позицій з урахуванням кількості', () => {
    // Arrange
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];

    // Act
    const result = calcSubtotal(items);

    // Assert
    expect(result).toBe(350);
  });

  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });

  it('відхиляє від’ємну ціну', () => {
    expect(() => calcSubtotal([item(-1)])).toThrow('NEGATIVE_PRICE');
  });

  it.each([0, -1, 1.5])('відхиляє некоректну кількість %s', (qty) => {
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY');
  });
});

describe('calcDiscountRate', () => {
  it.each([
    { tier: 'basic' as const, subtotal: 500, expected: 0 },
    { tier: 'silver' as const, subtotal: 500, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 500, expected: 0.1 },
    { tier: 'basic' as const, subtotal: 2000, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 2000, expected: 0.15 },
  ])(
    'рівень $tier із сумою $subtotal дає ставку $expected',
    ({ tier, subtotal, expected }) => {
      expect(calcDiscountRate(tier, subtotal)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])('межа великого замовлення: $subtotal', ({ subtotal, expected }) => {
    expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
  });

  it('обмежує сумарну знижку максимальним значенням 0.25', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBe(0.25);
  });

  it('відхиляє від’ємний промокод', () => {
    expect(() => calcDiscountRate('basic', 500, -0.1)).toThrow('INVALID_PROMO');
  });
});

describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %i → вартість доставки %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});

describe('calcOrderTotal', () => {
  it('додає доставку до замовлення нижче порога', () => {
    const total = calcOrderTotal([item(500)], 'basic');
    expect(total).toBeCloseTo(560, 2);
  });

  it('не додає доставку, якщо сума після знижки сягає порога', () => {
    // 1200 - 10 % = 1080 >= 1000, доставка безкоштовна
    const total = calcOrderTotal([item(1200)], 'gold');
    expect(total).toBeCloseTo(1080, 2);
  });

  it('знижка може опустити суму нижче порога доставки, нараховуючи оплату', () => {
    // 1050 - 10 % = 945 < 1000, тому доставка платна (+60)
    const total = calcOrderTotal([item(1050)], 'gold');
    expect(total).toBeCloseTo(1005, 2);
  });

  it('передає виняток із нижнього рівня для порожнього замовлення', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });
});

describe('mergeItems (Варіант 8)', () => {
  describe('Базове функціонування та збереження порядку', () => {
    it('об’єднує кілька дубльованих позицій одного SKU з підсумовуванням кількості', () => {
      const items: OrderItem[] = [
        { sku: 'A-100', price: 50, qty: 2 },
        { sku: 'A-100', price: 50, qty: 3 },
      ];

      const result = mergeItems(items);

      expect(result).toEqual([{ sku: 'A-100', price: 50, qty: 5 }]);
    });

    it('коректно зберігає унікальні позиції та порядок їх першої появи', () => {
      const items: OrderItem[] = [
        { sku: 'PROD-1', price: 100, qty: 1 },
        { sku: 'PROD-2', price: 200, qty: 4 },
        { sku: 'PROD-1', price: 100, qty: 3 },
      ];

      const result = mergeItems(items);

      expect(result).toEqual([
        { sku: 'PROD-1', price: 100, qty: 4 },
        { sku: 'PROD-2', price: 200, qty: 4 },
      ]);
    });

    it('повертає новий масив і не мутує вхідні об’єкти', () => {
      const original: OrderItem[] = [
        { sku: 'X-1', price: 25, qty: 1 },
        { sku: 'X-1', price: 25, qty: 2 },
      ];
      const copy = original.map((x) => ({ ...x }));

      const result = mergeItems(original);

      expect(result).not.toBe(original);
      expect(original).toEqual(copy);
    });
  });

  describe('Параметризовані тести злиття наборів товарів', () => {
    it.each([
      {
        description: 'набір без дублікатів залишається без змін',
        input: [
          { sku: 'SKU-A', price: 10, qty: 2 },
          { sku: 'SKU-B', price: 20, qty: 3 },
          { sku: 'SKU-C', price: 30, qty: 1 },
        ],
        expected: [
          { sku: 'SKU-A', price: 10, qty: 2 },
          { sku: 'SKU-B', price: 20, qty: 3 },
          { sku: 'SKU-C', price: 30, qty: 1 },
        ],
      },
      {
        description: 'набір із чергуванням однакових і різних SKU',
        input: [
          { sku: 'KEY-1', price: 45, qty: 1 },
          { sku: 'KEY-2', price: 80, qty: 2 },
          { sku: 'KEY-1', price: 45, qty: 5 },
          { sku: 'KEY-2', price: 80, qty: 1 },
        ],
        expected: [
          { sku: 'KEY-1', price: 45, qty: 6 },
          { sku: 'KEY-2', price: 80, qty: 3 },
        ],
      },
      {
        description: 'усі позиції мають однаковий SKU',
        input: [
          { sku: 'MONO', price: 15, qty: 2 },
          { sku: 'MONO', price: 15, qty: 4 },
          { sku: 'MONO', price: 15, qty: 6 },
        ],
        expected: [{ sku: 'MONO', price: 15, qty: 12 }],
      },
    ])('$description', ({ input, expected }) => {
      expect(mergeItems(input)).toEqual(expected);
    });
  });

  describe('Аналіз межових значень («межа − 1, межа, межа + 1»)', () => {
    // 1. Межа кількості позицій з однаковим SKU:
    // межа - 1: 1 позиція (злиття не потрібне)
    // межа:     2 позиції (одне злиття)
    // межа + 1: 3 позиції (два злиття поспіль)
    it.each([
      {
        testName: 'межа − 1 (1 позиція): злиття не відбувається',
        input: [{ sku: 'ITEM-1', price: 120, qty: 5 }],
        expected: [{ sku: 'ITEM-1', price: 120, qty: 5 }],
      },
      {
        testName: 'межа (2 позиції з однаковим SKU): рівно одне злиття',
        input: [
          { sku: 'ITEM-1', price: 120, qty: 5 },
          { sku: 'ITEM-1', price: 120, qty: 3 },
        ],
        expected: [{ sku: 'ITEM-1', price: 120, qty: 8 }],
      },
      {
        testName:
          'межа + 1 (3 позиції з однаковим SKU): послідовне дворазове злиття',
        input: [
          { sku: 'ITEM-1', price: 120, qty: 5 },
          { sku: 'ITEM-1', price: 120, qty: 3 },
          { sku: 'ITEM-1', price: 120, qty: 2 },
        ],
        expected: [{ sku: 'ITEM-1', price: 120, qty: 10 }],
      },
    ])('$testName', ({ input, expected }) => {
      expect(mergeItems(input)).toEqual(expected);
    });

    // 2. Межові значення кількості (qty):
    // межа - 1: qty = 0 (некоректно -> INVALID_QTY)
    // межа:     qty = 1 (мінімальна валідна кількість)
    // межа + 1: qty = 2 (стандартна додатна кількість)
    it('межа - 1 для кількості (qty = 0) призводить до винятку INVALID_QTY', () => {
      expect(() => mergeItems([{ sku: 'SKU-0', price: 10, qty: 0 }])).toThrow(
        'INVALID_QTY',
      );
    });

    it('межа для кількості (qty = 1) є коректною', () => {
      const res = mergeItems([{ sku: 'SKU-0', price: 10, qty: 1 }]);
      expect(res).toEqual([{ sku: 'SKU-0', price: 10, qty: 1 }]);
    });

    it('межа + 1 для кількості (qty = 2) є коректною', () => {
      const res = mergeItems([{ sku: 'SKU-0', price: 10, qty: 2 }]);
      expect(res).toEqual([{ sku: 'SKU-0', price: 10, qty: 2 }]);
    });

    // 3. Межові значення ціни (price):
    // межа - 1: price = -0.01 (некоректно -> NEGATIVE_PRICE)
    // межа:     price = 0 (допустима нульова ціна: подарунок/промо)
    // межа + 1: price = 0.01 (мінімальна додатна копійкова ціна)
    it('межа - 1 для ціни (price = -0.01) викликає виняток NEGATIVE_PRICE', () => {
      expect(() => mergeItems([{ sku: 'GIFT', price: -0.01, qty: 1 }])).toThrow(
        'NEGATIVE_PRICE',
      );
    });

    it('межа для ціни (price = 0) є валідною і підлягає злиттю', () => {
      const res = mergeItems([
        { sku: 'GIFT', price: 0, qty: 1 },
        { sku: 'GIFT', price: 0, qty: 2 },
      ]);
      expect(res).toEqual([{ sku: 'GIFT', price: 0, qty: 3 }]);
    });

    it('межа + 1 для ціни (price = 0.01) є валідною і підлягає злиттю', () => {
      const res = mergeItems([
        { sku: 'PENNY', price: 0.01, qty: 2 },
        { sku: 'PENNY', price: 0.01, qty: 3 },
      ]);
      expect(res).toEqual([{ sku: 'PENNY', price: 0.01, qty: 5 }]);
    });
  });

  describe('Валідація та винятки з власними кодами помилок', () => {
    it('відхиляє некоректну структуру вхідних даних або порожній список (EMPTY_ITEMS)', () => {
      expect(() => mergeItems([])).toThrow('EMPTY_ITEMS');
      // @ts-expect-error перевірка виклику без масиву
      expect(() => mergeItems(null)).toThrow('EMPTY_ITEMS');
    });

    it.each(['', '   ', null, undefined])(
      'відхиляє позицію з невалідним або порожнім sku: %j (INVALID_SKU)',
      (invalidSku) => {
        expect(() =>
          // @ts-expect-error перевірка невалідного типу SKU
          mergeItems([{ sku: invalidSku, price: 50, qty: 1 }]),
        ).toThrow('INVALID_SKU');
      },
    );

    it.each([-10, -0.01, NaN])(
      'відхиляє від’ємну або NaN ціну: %s (NEGATIVE_PRICE)',
      (invalidPrice) => {
        expect(() =>
          mergeItems([{ sku: 'TEST', price: invalidPrice, qty: 1 }]),
        ).toThrow('NEGATIVE_PRICE');
      },
    );

    it.each([0, -1, 2.5])(
      'відхиляє недодатну або дробову кількість: %s (INVALID_QTY)',
      (invalidQty) => {
        expect(() =>
          mergeItems([{ sku: 'TEST', price: 100, qty: invalidQty }]),
        ).toThrow('INVALID_QTY');
      },
    );

    it('генерує PRICE_MISMATCH при спробі злити однакові SKU з різними цінами', () => {
      const items: OrderItem[] = [
        { sku: 'CONFLICT-SKU', price: 100, qty: 1 },
        { sku: 'CONFLICT-SKU', price: 120, qty: 2 },
      ];

      expect(() => mergeItems(items)).toThrow('PRICE_MISMATCH');
    });
  });
});
