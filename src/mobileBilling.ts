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
  if (minutes <= 100) {
    return 150;
  }
  const extraMinutes = minutes - 100;
  return 150 + extraMinutes * 0.5;
}
