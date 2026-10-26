import { BonusService } from './bonus-service';
import { HttpProfileProvider } from './profile-provider';
import { InMemoryBonusRepository } from '../tests/fakes/in-memory-bonus-repository';

async function runDemo() {
  console.log('=== Демонстрація роботи BonusService (Варіант 8) ===\n');

  const repo = new InMemoryBonusRepository();
  repo.setInitialBalance('client-101', 50);

  const mockProvider = {
    async getProfile(id: string) {
      return {
        id,
        name: 'Пашков Сергій',
        tier: 'gold' as const,
        isActive: true,
        multiplier: 1.5,
      };
    },
  };

  const notifier = {
    async notify(clientId: string, msg: string) {
      console.log(`[SMS/Email Notifier -> ${clientId}]: ${msg}`);
    },
  };

  const service = new BonusService(mockProvider, repo, notifier);

  console.log('Початковий баланс клієнта client-101:', await repo.getBalance('client-101'));
  console.log('Клієнт робить покупку на 2000 грн (бонус = 2000 * 5% * 1.5 = 150 бонусів)...');

  const result = await service.accrueBonuses('client-101', 2000);
  console.log('Результат нарахування:', result);
  console.log('Новий баланс у сховищі:', await repo.getBalance('client-101'));
}

runDemo().catch(console.error);
