import { describe, it, expect } from 'vitest';
import { calcMobileBill } from '../src/mobileBilling';

describe('Тарифікатор мобільного зв’язку (TDD)', () => {
  describe('Цикл 1: Валідація тривалості внутрішніх дзвінків', () => {
    it.each([-1, -60, 10.5, 0.25])(
      'відхиляє від’ємну або дробову тривалість хвилин: %s',
      (minutes) => {
        expect(() => calcMobileBill(minutes)).toThrow('INVALID_MINUTES');
      },
    );
  });

  describe('Цикл 2: Базова абонплата', () => {
    it('нараховує фіксовану абонплату 150 грн при 0 хвилинах', () => {
      expect(calcMobileBill(0)).toBe(150);
    });
  });

  describe('Цикл 3: Включений пакет 100 хвилин', () => {
    it.each([
      { minutes: 0, expected: 150 },
      { minutes: 1, expected: 150 },
      { minutes: 50, expected: 150 },
      { minutes: 99, expected: 150 },
      { minutes: 100, expected: 150 },
    ])(
      'перші 100 хвилин включено в абонплату: $minutes хв -> $expected грн',
      ({ minutes, expected }) => {
        expect(calcMobileBill(minutes)).toBe(expected);
      },
    );
  });

  describe('Цикл 4: Понадпакетні внутрішні хвилини (0.5 грн/хв)', () => {
    it.each([
      { minutes: 101, expected: 150.5 },
      { minutes: 110, expected: 155 },
      { minutes: 120, expected: 160 },
      { minutes: 180, expected: 190 },
      { minutes: 200, expected: 200 },
    ])(
      'тривалість $minutes хв понад пакет -> $expected грн',
      ({ minutes, expected }) => {
        expect(calcMobileBill(minutes)).toBe(expected);
      },
    );
  });

  describe('Цикл 5: Міжнародні дзвінки (3 грн/хв)', () => {
    it.each([-1, -15, 2.5])(
      'відхиляє некоректні міжнародні хвилини: %s',
      (invalidIntl) => {
        expect(() =>
          calcMobileBill(50, { internationalMinutes: invalidIntl }),
        ).toThrow('INVALID_INTERNATIONAL_MINUTES');
      },
    );

    it.each([
      { minutes: 0, intl: 1, expected: 153 },
      { minutes: 50, intl: 5, expected: 165 },
      { minutes: 100, intl: 10, expected: 180 },
      { minutes: 100, intl: 25, expected: 225 },
    ])(
      'міжнародні дзвінки $intl хв при $minutes стандартних хв -> $expected грн',
      ({ minutes, intl, expected }) => {
        expect(calcMobileBill(minutes, { internationalMinutes: intl })).toBe(
          expected,
        );
      },
    );
  });

  describe('Цикл 6: Комплексна тарифікація (взаємодія правил)', () => {
    it.each([
      { minutes: 120, intl: 5, expected: 175 },
      { minutes: 150, intl: 20, expected: 235 },
      { minutes: 200, intl: 50, expected: 350 },
    ])(
      'комбінований тариф ($minutes хв стандартних + $intl хв міжнародних) -> $expected грн',
      ({ minutes, intl, expected }) => {
        expect(calcMobileBill(minutes, { internationalMinutes: intl })).toBe(
          expected,
        );
      },
    );
  });

  describe('Цикл 7: Знижка лояльності та заокруглення до копійок', () => {
    it.each([
      { minutes: 100, opts: { loyaltyDiscount: true }, expected: 135 },
      { minutes: 101, opts: { loyaltyDiscount: true }, expected: 135.45 },
      {
        minutes: 103,
        opts: { internationalMinutes: 1, loyaltyDiscount: true },
        expected: 139.05,
      },
      { minutes: 101, opts: { loyaltyDiscount: false }, expected: 150.5 },
      { minutes: 100, opts: undefined, expected: 150 },
    ])(
      'розрахунок для $minutes хв та $opts -> $expected грн',
      ({ minutes, opts, expected }) => {
        expect(calcMobileBill(minutes, opts)).toBeCloseTo(expected, 2);
      },
    );
  });

  describe('Додаткові тести: перевірка декомпонованих підфункцій', () => {
    it('прямий виклик calcDomesticFee для межових точок', () => {
      expect(calcMobileBill(99)).toBe(150);
      expect(calcMobileBill(100)).toBe(150);
      expect(calcMobileBill(101)).toBe(150.5);
    });

    it('прямий виклик calcMobileBill без другого аргументу options', () => {
      expect(calcMobileBill(50)).toBe(150);
      expect(calcMobileBill(120)).toBe(160);
    });
  });
});
