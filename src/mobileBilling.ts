export interface MobileBillingOptions {
  internationalMinutes?: number;
  loyaltyDiscount?: boolean;
}

export function calcMobileBill(
  minutes: number,
  options: MobileBillingOptions = {},
): number {
  throw new Error('INVALID_MINUTES');
}
