export const BASE_SUBSCRIPTION_FEE = 150;
export const INCLUDED_DOMESTIC_MINUTES = 100;
export const EXTRA_DOMESTIC_MINUTE_RATE = 0.5;

export interface MobileBillingOptions {
  internationalMinutes?: number;
  loyaltyDiscount?: boolean;
}

export function calcMobileBill(
  minutes: number,
  options: MobileBillingOptions = {},
): number {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new Error('INVALID_MINUTES');
  }
  if (minutes <= INCLUDED_DOMESTIC_MINUTES) {
    return BASE_SUBSCRIPTION_FEE;
  }
  const extraMinutes = minutes - INCLUDED_DOMESTIC_MINUTES;
  return BASE_SUBSCRIPTION_FEE + extraMinutes * EXTRA_DOMESTIC_MINUTE_RATE;
}
