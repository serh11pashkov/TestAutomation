import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BonusService } from '../src/bonus-service';
import type { ProfileProvider, BonusNotifier } from '../src/bonus-service';
import { InMemoryBonusRepository } from './fakes/in-memory-bonus-repository';

describe('BonusService — сервіс нарахування бонусів (Варіант № 8)', () => {
  let profileProvider: ProfileProvider;
  let fakeRepo: InMemoryBonusRepository;
  let notifier: BonusNotifier;
  let service: BonusService;

  beforeEach(() => {
    profileProvider = {
      getProfile: vi.fn().mockResolvedValue({
        id: 'client-1',
        name: 'Сергій Пашков',
        tier: 'gold',
        isActive: true,
        multiplier: 1.5,
      }),
    };
    fakeRepo = new InMemoryBonusRepository();
    fakeRepo.setInitialBalance('client-1', 100);

    notifier = {
      notify: vi.fn().mockResolvedValue(undefined),
    };

    service = new BonusService(profileProvider, fakeRepo, notifier);
  });

  describe('Успішне нарахування бонусів (перевірка стану)', () => {
    it('нараховує бонуси з урахуванням множника статусу та оновлює стан сховища', async () => {
      const result = await service.accrueBonuses('client-1', 1000);

      expect(result.bonusesAdded).toBe(75);
      expect(result.newBalance).toBe(175);

      const currentBalance = await fakeRepo.getBalance('client-1');
      expect(currentBalance).toBe(175);
    });

    it('перевірка взаємодії: надсилає сповіщення клієнту про нарахування бонусів', async () => {
      await service.accrueBonuses('client-1', 2000);

      expect(notifier.notify).toHaveBeenCalledTimes(1);
      expect(notifier.notify).toHaveBeenCalledWith(
        'client-1',
        expect.stringContaining('150 бонусів'),
      );
    });

    it('фіксує системний час нарахування через підміну таймерів', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-26T14:30:00.000Z'));

      const result = await service.accrueBonuses('client-1', 500);
      expect(result.accruedAt).toBe('2026-10-26T14:30:00.000Z');

      vi.useRealTimers();
    });
  });

  describe('Сценарії відмов та захист стану (Баланс НЕ оновлюється)', () => {
    it('баланс не оновлюється при недоступності профілю клієнта (HTTP помилка)', async () => {
      profileProvider.getProfile = vi
        .fn()
        .mockRejectedValue(new Error('PROFILE_UNAVAILABLE'));

      await expect(service.accrueBonuses('client-1', 1000)).rejects.toThrow(
        'PROFILE_UNAVAILABLE',
      );

      expect(await fakeRepo.getBalance('client-1')).toBe(100);
      expect(notifier.notify).not.toHaveBeenCalled();
    });

    it('баланс не оновлюється, якщо профіль деактивовано', async () => {
      profileProvider.getProfile = vi.fn().mockResolvedValue({
        id: 'client-1',
        name: 'Сергій Пашков',
        tier: 'gold',
        isActive: false,
        multiplier: 1.5,
      });

      await expect(service.accrueBonuses('client-1', 1000)).rejects.toThrow(
        'CLIENT_INACTIVE',
      );

      expect(await fakeRepo.getBalance('client-1')).toBe(100);
      expect(notifier.notify).not.toHaveBeenCalled();
    });

    it('відхиляє некоректну суму покупки та не звертається до провайдера чи сховища', async () => {
      await expect(service.accrueBonuses('client-1', 0)).rejects.toThrow(
        'INVALID_PURCHASE_AMOUNT',
      );

      await expect(service.accrueBonuses('client-1', -50)).rejects.toThrow(
        'INVALID_PURCHASE_AMOUNT',
      );

      expect(profileProvider.getProfile).not.toHaveBeenCalled();
      expect(await fakeRepo.getBalance('client-1')).toBe(100);
      expect(notifier.notify).not.toHaveBeenCalled();
    });
  });
});
