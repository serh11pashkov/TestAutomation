import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderService } from '../src/order-service';
import type {
  RateProvider,
  OrderRepository,
  Notifier,
} from '../src/order-service';
import { InMemoryOrderRepository } from './fakes/in-memory-repository';
import { withRetry } from '../src/retry';

describe('OrderService — заглушки й шпигуни (Частина 1)', () => {
  let rates: RateProvider;
  let repo: OrderRepository;
  let notifier: Notifier;
  let service: OrderService;

  beforeEach(() => {
    rates = { getRate: vi.fn().mockResolvedValue(41) };
    repo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    notifier = { send: vi.fn().mockResolvedValue(undefined) };
    service = new OrderService(rates, repo, notifier);
  });

  it('конвертує суму за отриманим курсом', async () => {
    const record = await service.placeOrder({
      id: 'A-1',
      amountUsd: 100,
      email: 'u@e.com',
    });
    expect(record.amountUah).toBeCloseTo(4100, 2);
  });

  it('надсилає сповіщення з сумою в гривнях', async () => {
    await service.placeOrder({
      id: 'A-2',
      amountUsd: 10,
      email: 'client@e.com',
    });

    expect(notifier.send).toHaveBeenCalledTimes(1);
    expect(notifier.send).toHaveBeenCalledWith(
      'client@e.com',
      expect.stringContaining('410'),
    );
  });

  it('не звертається до залежностей за некоректної суми', async () => {
    await expect(
      service.placeOrder({ id: 'A-3', amountUsd: 0, email: 'u@e.com' }),
    ).rejects.toThrow('INVALID_AMOUNT');

    expect(rates.getRate).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('збережене замовлення можна прочитати зі сховища (перевірка стану)', async () => {
    const fakeRepo = new InMemoryOrderRepository();
    const serviceWithFake = new OrderService(rates, fakeRepo, notifier);

    await serviceWithFake.placeOrder({
      id: 'A-4',
      amountUsd: 50,
      email: 'u@e.com',
    });

    const saved = await fakeRepo.findById('A-4');
    expect(saved?.amountUah).toBeCloseTo(2050, 2);
    expect(fakeRepo.size).toBe(1);
  });

  it('не зберігає замовлення й не надсилає листа, якщо курс недоступний', async () => {
    const fakeRepo = new InMemoryOrderRepository();
    rates.getRate = vi.fn().mockRejectedValue(new Error('RATE_UNAVAILABLE'));
    const serviceWithFake = new OrderService(rates, fakeRepo, notifier);

    await expect(
      serviceWithFake.placeOrder({
        id: 'A-5',
        amountUsd: 100,
        email: 'u@e.com',
      }),
    ).rejects.toThrow('RATE_UNAVAILABLE');

    expect(fakeRepo.size).toBe(0);
    expect(notifier.send).not.toHaveBeenCalled();
  });

  describe('фіксація часу', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-15T10:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('записує момент створення замовлення', async () => {
      const record = await service.placeOrder({
        id: 'A-6',
        amountUsd: 20,
        email: 'u@e.com',
      });
      expect(record.createdAt).toBe('2026-03-15T10:00:00.000Z');
    });
  });

  describe('підміна таймерів та повторні спроби withRetry', () => {
    it('повторює спробу після невдачі', async () => {
      vi.useFakeTimers();
      const action = vi
        .fn()
        .mockRejectedValueOnce(new Error('TIMEOUT'))
        .mockResolvedValueOnce('ok');

      const promise = withRetry(action, 3, 1000);
      await vi.advanceTimersByTimeAsync(1000);

      await expect(promise).resolves.toBe('ok');
      expect(action).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it('після вичерпання спроб повертає останню помилку', async () => {
      vi.useFakeTimers();
      const action = vi.fn().mockRejectedValue(new Error('TIMEOUT'));

      const promise = withRetry(action, 3, 1000);
      const assertion = expect(promise).rejects.toThrow('TIMEOUT');
      await vi.advanceTimersByTimeAsync(2000);

      await assertion;
      expect(action).toHaveBeenCalledTimes(3);
      vi.useRealTimers();
    });
  });
});
