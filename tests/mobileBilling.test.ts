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
});
