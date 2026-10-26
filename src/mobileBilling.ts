export const BASE_SUBSCRIPTION_FEE = 150;
export const INCLUDED_DOMESTIC_MINUTES = 100;
export const EXTRA_DOMESTIC_MINUTE_RATE = 0.5;
export const INTERNATIONAL_MINUTE_RATE = 3.0;

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

  const intlMinutes = options.internationalMinutes ?? 0;
  if (!Number.isInteger(intlMinutes) || intlMinutes < 0) {
    throw new Error('INVALID_INTERNATIONAL_MINUTES');
  }

  let total = BASE_SUBSCRIPTION_FEE;
  if (minutes > INCLUDED_DOMESTIC_MINUTES) {
    total += (minutes - INCLUDED_DOMESTIC_MINUTES) * EXTRA_DOMESTIC_MINUTE_RATE;
  }
  total += intlMinutes * INTERNATIONAL_MINUTE_RATE;
  return total;
}
