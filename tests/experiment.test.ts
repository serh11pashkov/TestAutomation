import { describe, it, expect, vi } from 'vitest';
import { OrderService } from '../src/order-service';
import type {
  RateProvider,
  OrderRepository,
  Notifier,
  OrderRecord,
} from '../src/order-service';
import { InMemoryOrderRepository } from './fakes/in-memory-repository';

// Клас із внутрішнім рефакторингом (збереження у 2 кроки: draft -> confirmed)
class RefactoredTwoStepOrderService {
  constructor(
    private rates: RateProvider,
    private repo: OrderRepository,
    private notifier: Notifier,
  ) {}

  async placeOrder(order: {
    id: string;
    amountUsd: number;
    email: string;
  }): Promise<OrderRecord> {
    if (order.amountUsd <= 0) throw new Error('INVALID_AMOUNT');
    const rate = await this.rates.getRate('USD', 'UAH');
    const amountUah = Math.round(order.amountUsd * rate * 100) / 100;

    const draftRecord: OrderRecord = {
      ...order,
      amountUah,
      createdAt: new Date().toISOString(),
    };
    // Крок 1: проміжне збереження чернетки
    await this.repo.save(draftRecord);

    // Крок 2: збереження остаточного запису
    const confirmedRecord: OrderRecord = {
      ...draftRecord,
    };
    await this.repo.save(confirmedRecord);

    await this.notifier.send(
      order.email,
      `Замовлення ${order.id} на суму ${amountUah} грн прийнято`,
    );
    return confirmedRecord;
  }
}

describe('Крок 9. Експеримент: Стан проти взаємодії (State vs Interaction)', () => {
  const rates: RateProvider = { getRate: vi.fn().mockResolvedValue(40) };
  const notifier: Notifier = { send: vi.fn().mockResolvedValue(undefined) };

  it('1. Оригінальний сервіс: тест взаємодії проходить (toHaveBeenCalledTimes 1)', async () => {
    const spyRepo: OrderRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    const service = new OrderService(rates, spyRepo, notifier);
    await service.placeOrder({ id: 'EXP-1', amountUsd: 10, email: 'u@e.com' });

    expect(spyRepo.save).toHaveBeenCalledTimes(1);
  });

  it('2. Рефакторинг: тест перевірки СТАНУ через підробку залишається ЗЕЛЕНИМ', async () => {
    const fakeRepo = new InMemoryOrderRepository();
    const service = new RefactoredTwoStepOrderService(
      rates,
      fakeRepo,
      notifier,
    );
    await service.placeOrder({ id: 'EXP-2', amountUsd: 10, email: 'u@e.com' });

    // Стан сховища ідеальний: замовлення збережено, розмір сховища = 1
    const saved = await fakeRepo.findById('EXP-2');
    expect(saved?.amountUah).toBe(400);
    expect(fakeRepo.size).toBe(1);
  });

  it('3. Рефакторинг: тест ВЗАЄМОДІЇ падає, бо save викликано двічі замість одного', async () => {
    const spyRepo: OrderRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    const service = new RefactoredTwoStepOrderService(rates, spyRepo, notifier);
    await service.placeOrder({ id: 'EXP-3', amountUsd: 10, email: 'u@e.com' });

    // Цей тест демонструє крихкість перевірки взаємодії:
    // expect(spyRepo.save).toHaveBeenCalledTimes(1) впав би!
    // Фактична кількість викликів стала 2:
    expect(spyRepo.save).toHaveBeenCalledTimes(2);
  });
});
