import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, CLIENT_API_BASE } from './msw/server';
import { HttpProfileProvider } from '../src/profile-provider';

const provider = new HttpProfileProvider(CLIENT_API_BASE);

describe('HttpProfileProvider — мережеві тести MSW (Варіант № 8)', () => {
  it('Сценарій 1 (Успіх): повертає коректний профіль клієнта зі статусом 200', async () => {
    const profile = await provider.getProfile('user-42');

    expect(profile.id).toBe('user-42');
    expect(profile.name).toBe('Сергій Пашков');
    expect(profile.tier).toBe('gold');
    expect(profile.isActive).toBe(true);
    expect(profile.multiplier).toBe(1.5);
  });

  it('Сценарій 2 (Помилковий статус): відхиляє запит зі статусом 404/500 помилкою PROFILE_UNAVAILABLE', async () => {
    server.use(
      http.get(`${CLIENT_API_BASE}/clients/:id`, () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    await expect(provider.getProfile('unknown-client')).rejects.toThrow(
      'PROFILE_UNAVAILABLE',
    );
  });

  it('Сценарій 3 (Некоректний формат): відхиляє відповідь, якщо множник або статус пошкоджено', async () => {
    server.use(
      http.get(`${CLIENT_API_BASE}/clients/:id`, () => {
        return HttpResponse.json({
          id: 'user-corrupted',
          name: 'Тест',
          multiplier: 'NOT_A_NUMBER',
          isActive: true,
        });
      }),
    );

    await expect(provider.getProfile('user-corrupted')).rejects.toThrow(
      'INVALID_PROFILE_FORMAT',
    );
  });

  it('передає коректний ідентифікатор клієнта в URL запиту', async () => {
    let capturedId = '';
    server.use(
      http.get(`${CLIENT_API_BASE}/clients/:id`, ({ params }) => {
        capturedId = String(params.id);
        return HttpResponse.json({
          id: capturedId,
          name: 'Тест',
          tier: 'silver',
          multiplier: 1.2,
          isActive: true,
        });
      }),
    );

    await provider.getProfile('client-abc-999');
    expect(capturedId).toBe('client-abc-999');
  });

  it('використовує standard як резервний tier за його відсутності', async () => {
    server.use(
      http.get(`${CLIENT_API_BASE}/clients/:id`, () => {
        return HttpResponse.json({
          id: 'user-no-tier',
          name: 'Без статусу',
          multiplier: 1.0,
          isActive: true,
        });
      }),
    );

    const profile = await provider.getProfile('user-no-tier');
    expect(profile.tier).toBe('standard');
  });
});
