export type Tier = 'basic' | 'silver' | 'gold';

export interface OrderItem {
  sku: string;
  price: number;
  qty: number;
}

export const TIER_DISCOUNT: Record<Tier, number> = {
  basic: 0,
  silver: 0.05,
  gold: 0.1,
};

export const BIG_ORDER_FROM = 2000;
export const BIG_ORDER_BONUS = 0.05;
export const MAX_DISCOUNT = 0.25;
export const FREE_SHIPPING_FROM = 1000;
export const SHIPPING_FEE = 60;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcSubtotal(items: OrderItem[]): number {
  if (items.length === 0) throw new Error('EMPTY_ORDER');
  return items.reduce((sum, item) => {
    if (item.price < 0) throw new Error('NEGATIVE_PRICE');
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error('INVALID_QTY');
    }
    return sum + item.price * item.qty;
  }, 0);
}

export function calcDiscountRate(
  tier: Tier,
  subtotal: number,
  promoRate = 0,
): number {
  if (promoRate < 0) throw new Error('INVALID_PROMO');
  let rate = TIER_DISCOUNT[tier];
  if (subtotal >= BIG_ORDER_FROM) rate += BIG_ORDER_BONUS;
  return Math.min(rate + promoRate, MAX_DISCOUNT);
}

export function calcShipping(amount: number): number {
  return amount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

export function calcOrderTotal(
  items: OrderItem[],
  tier: Tier,
  promoRate = 0,
): number {
  const subtotal = calcSubtotal(items);
  const rate = calcDiscountRate(tier, subtotal, promoRate);
  const afterDiscount = round2(subtotal * (1 - rate));
  return round2(afterDiscount + calcShipping(afterDiscount));
}

/**
 * Варіант 8: Об'єднання однакових позицій за полем sku із підсумовуванням кількості.
 *
 * Бізнес-правила:
 * 1. items не може бути порожнім масивом або не масивом (код помилки: EMPTY_ITEMS).
 * 2. Кожна позиція повинна мати валідний непустий sku (код помилки: INVALID_SKU).
 * 3. Ціна позиції не може бути від'ємною (код помилки: NEGATIVE_PRICE).
 * 4. Кількість позиції повинна бути натуральним цілим числом >= 1 (код помилки: INVALID_QTY).
 * 5. Якщо позиції мають однаковий sku, їхня ціна за одиницю повинна збігатися (код помилки: PRICE_MISMATCH).
 * 6. Повертається новий масив, порядок збережено за першою появою sku.
 */
export function mergeItems(items: OrderItem[]): OrderItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('EMPTY_ITEMS');
  }

  const mergedMap = new Map<string, OrderItem>();

  for (const item of items) {
    if (!item.sku || typeof item.sku !== 'string' || item.sku.trim() === '') {
      throw new Error('INVALID_SKU');
    }
    if (
      typeof item.price !== 'number' ||
      Number.isNaN(item.price) ||
      item.price < 0
    ) {
      throw new Error('NEGATIVE_PRICE');
    }
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error('INVALID_QTY');
    }

    const existing = mergedMap.get(item.sku);
    if (!existing) {
      mergedMap.set(item.sku, {
        sku: item.sku,
        price: item.price,
        qty: item.qty,
      });
    } else {
      if (Math.abs(existing.price - item.price) > 0.001) {
        throw new Error('PRICE_MISMATCH');
      }
      existing.qty += item.qty;
    }
  }

  return Array.from(mergedMap.values());
}
