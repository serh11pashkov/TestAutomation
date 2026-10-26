import type { BonusRepository } from '../../src/bonus-service';

export class InMemoryBonusRepository implements BonusRepository {
  private balances = new Map<string, number>();

  async updateBalance(clientId: string, bonusDelta: number): Promise<void> {
    const current = this.balances.get(clientId) ?? 0;
    this.balances.set(clientId, current + bonusDelta);
  }

  async getBalance(clientId: string): Promise<number> {
    return this.balances.get(clientId) ?? 0;
  }

  setInitialBalance(clientId: string, balance: number): void {
    this.balances.set(clientId, balance);
  }

  get size(): number {
    return this.balances.size;
  }
}
