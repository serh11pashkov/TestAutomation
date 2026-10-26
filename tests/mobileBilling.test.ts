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
});
