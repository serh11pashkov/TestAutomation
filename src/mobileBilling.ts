/**
 * Модуль розрахунку вартості послуг мобільного зв'язку (Варіант № 8).
 * Розроблено за дисципліною Test-Driven Development (TDD) у циклі Red - Green - Refactor.
 */

export const BASE_SUBSCRIPTION_FEE = 150;
export const INCLUDED_DOMESTIC_MINUTES = 100;
export const EXTRA_DOMESTIC_MINUTE_RATE = 0.5;
export const INTERNATIONAL_MINUTE_RATE = 3.0;
export const LOYALTY_DISCOUNT_RATE = 0.9;

export interface MobileBillingOptions {
  /** Тривалість міжнародних дзвінків у хвилинах (не входять у базовий пакет) */
  internationalMinutes?: number;
  /** Прапорець участі у програмі лояльності (знижка 10% на підсумковий рахунок) */
  loyaltyDiscount?: boolean;
}

/**
 * Банківське заокруглення результату до 2 знаків після коми (копійки).
 */
export const round2 = (val: number): number => Math.round(val * 100) / 100;

/**
 * Валідація невід'ємного цілого значення тривалості дзвінків.
 */
export function assertValidMinutes(minutes: number, errorCode: string): void {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new Error(errorCode);
  }
}

/**
 * Розрахунок вартості дзвінків по Україні з урахуванням включеного пакету 100 хвилин.
 */
export function calcDomesticFee(minutes: number): number {
  if (minutes <= INCLUDED_DOMESTIC_MINUTES) {
    return BASE_SUBSCRIPTION_FEE;
  }
  const extraMinutes = minutes - INCLUDED_DOMESTIC_MINUTES;
  return BASE_SUBSCRIPTION_FEE + extraMinutes * EXTRA_DOMESTIC_MINUTE_RATE;
}

/**
 * Розрахунок вартості міжнародних дзвінків за фіксованим тарифом 3.00 грн/хв.
 */
export function calcInternationalFee(internationalMinutes: number): number {
  return internationalMinutes * INTERNATIONAL_MINUTE_RATE;
}

/**
 * Застосування знижок до підсумкової суми нарахувань.
 */
export function applyDiscounts(
  baseAmount: number,
  options: MobileBillingOptions,
): number {
  let result = baseAmount;
  if (options.loyaltyDiscount) {
    result *= LOYALTY_DISCOUNT_RATE;
  }
  return result;
}

/**
 * Головна функція тарифікації мобільного зв'язку.
 *
 * @param minutes Кількість стандартних хвилин по Україні
 * @param options Додаткові параметри викликів та знижок
 * @returns Підсумкова сума до сплати у гривнях, заокруглена до копійок
 */
export function calcMobileBill(
  minutes: number,
  options: MobileBillingOptions = {},
): number {
  assertValidMinutes(minutes, 'INVALID_MINUTES');

  const intlMinutes = options.internationalMinutes ?? 0;
  assertValidMinutes(intlMinutes, 'INVALID_INTERNATIONAL_MINUTES');

  const domesticFee = calcDomesticFee(minutes);
  const internationalFee = calcInternationalFee(intlMinutes);
  const subtotal = domesticFee + internationalFee;

  const total = applyDiscounts(subtotal, options);
  return round2(total);
}
