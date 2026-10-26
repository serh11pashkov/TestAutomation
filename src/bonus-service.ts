export type ClientTier = 'standard' | 'silver' | 'gold' | 'platinum';

export interface ClientProfile {
  id: string;
  name: string;
  tier: ClientTier;
  isActive: boolean;
  multiplier: number;
}

export interface ProfileProvider {
  getProfile(clientId: string): Promise<ClientProfile>;
}

export interface BonusRepository {
  updateBalance(clientId: string, bonusDelta: number): Promise<void>;
  getBalance(clientId: string): Promise<number>;
}

export interface BonusNotifier {
  notify(clientId: string, message: string): Promise<void>;
}

export interface BonusAccrualResult {
  clientId: string;
  bonusesAdded: number;
  newBalance: number;
  accruedAt: string;
}

export class BonusService {
  constructor(
    private profileProvider: ProfileProvider,
    private repository: BonusRepository,
    private notifier: BonusNotifier,
  ) {}

  async accrueBonuses(
    clientId: string,
    purchaseAmount: number,
  ): Promise<BonusAccrualResult> {
    if (purchaseAmount <= 0) {
      throw new Error('INVALID_PURCHASE_AMOUNT');
    }

    const profile = await this.profileProvider.getProfile(clientId);

    if (!profile.isActive) {
      throw new Error('CLIENT_INACTIVE');
    }

    const bonusesAdded = Math.round(purchaseAmount * 0.05 * profile.multiplier);

    await this.repository.updateBalance(clientId, bonusesAdded);
    const newBalance = await this.repository.getBalance(clientId);

    const result: BonusAccrualResult = {
      clientId,
      bonusesAdded,
      newBalance,
      accruedAt: new Date().toISOString(),
    };

    await this.notifier.notify(
      clientId,
      `Вам нараховано ${bonusesAdded} бонусів. Новий баланс: ${newBalance}`,
    );

    return result;
  }
}
