import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { login, makeOrderPayload } from './helpers';

describe('Варіант № 8: Обмеження частоти створення замовлень (Rate Limiter)', () => {
  let app: ReturnType<typeof createApp>;
  let bobToken: string;
  let aliceToken: string;

  beforeEach(async () => {
    app = createApp({ rateLimitMax: 5, rateLimitWindowMs: 60000 });
    bobToken = await login(app, 'bob@example.com');
    aliceToken = await login(app, 'alice@example.com');
  });

  it('дозволяє створити до 5 замовлень за хвилину для одного користувача', async () => {
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${bobToken}`)
        .send(makeOrderPayload());

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
    }
  });

  it('блокує 6-й запит за хвилину: статус 429 та заголовок Retry-After', async () => {
    // 5 успішних запитів
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${bobToken}`)
        .send(makeOrderPayload());
    }

    // 6-й запит має повернути 429
    const sixthRes = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${bobToken}`)
      .send(makeOrderPayload());

    expect(sixthRes.status).toBe(429);
    expect(sixthRes.headers['retry-after']).toBeDefined();
    expect(Number(sixthRes.headers['retry-after'])).toBeGreaterThanOrEqual(1);
    expect(sixthRes.body.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(sixthRes.body.message).toContain('Limit is 5 orders per minute');
  });

  it('ізоляція лімітів: блокування одного користувача не впливає на іншого', async () => {
    // Вичерпуємо ліміт для Bob (5 запитів)
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${bobToken}`)
        .send(makeOrderPayload());
    }

    // Bob заблокований
    const bobBlocked = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${bobToken}`)
      .send(makeOrderPayload());
    expect(bobBlocked.status).toBe(429);

    // Alice повинна успішно створити замовлення
    const aliceRes = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send(makeOrderPayload());

    expect(aliceRes.status).toBe(201);
    expect(aliceRes.body.tier).toBe('gold');
  });

  it('відновлює можливість створення замовлень після завершення вікна обмеження', async () => {
    // Створюємо інстанс із коротким вікном 150 мс для швидкого тесту скидання
    const shortWindowApp = createApp({
      rateLimitMax: 5,
      rateLimitWindowMs: 150,
    });
    const token = await login(shortWindowApp, 'bob@example.com');

    for (let i = 1; i <= 5; i++) {
      await request(shortWindowApp)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(makeOrderPayload());
    }

    // 6-й запит заблоковано
    const blocked = await request(shortWindowApp)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(makeOrderPayload());
    expect(blocked.status).toBe(429);

    // Чекаємо завершення вікна
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Після очікування запит знову проходить
    const recovered = await request(shortWindowApp)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(makeOrderPayload());
    expect(recovered.status).toBe(201);
  });
});
