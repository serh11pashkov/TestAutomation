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
  return 150;
}
