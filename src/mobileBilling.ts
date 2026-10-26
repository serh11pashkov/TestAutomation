export const BASE_SUBSCRIPTION_FEE = 150;
export const INCLUDED_DOMESTIC_MINUTES = 100;
export const EXTRA_DOMESTIC_MINUTE_RATE = 0.5;
export const INTERNATIONAL_MINUTE_RATE = 3.0;
export const LOYALTY_DISCOUNT_RATE = 0.9;

export interface MobileBillingOptions {
  internationalMinutes?: number;
  loyaltyDiscount?: boolean;
}

export const round2 = (val: number): number => Math.round(val * 100) / 100;

export function assertValidMinutes(minutes: number, errorCode: string): void {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new Error(errorCode);
  }
}

export function calcDomesticFee(minutes: number): number {
  if (minutes <= INCLUDED_DOMESTIC_MINUTES) {
    return BASE_SUBSCRIPTION_FEE;
  }
  const extraMinutes = minutes - INCLUDED_DOMESTIC_MINUTES;
  return BASE_SUBSCRIPTION_FEE + extraMinutes * EXTRA_DOMESTIC_MINUTE_RATE;
}

export function calcInternationalFee(internationalMinutes: number): number {
  return internationalMinutes * INTERNATIONAL_MINUTE_RATE;
}

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
