import { describe, it, expect } from 'vitest';
import request from 'supertest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createApp } from '../src/app';
import { login, makeOrderPayload } from './helpers';
import { orderSchema } from './schemas/order.schema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('Крок 7. Експеримент: Захист контракту та витік полів (additionalProperties: false)', () => {
  it('1. Штатний режим (toPublic): схема валідується успішно (errors = [])', async () => {
    const normalApp = createApp({ leakOwnerIdForTest: false });
    const token = await login(normalApp, 'bob@example.com');

    const res = await request(normalApp)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(makeOrderPayload());

    expect(res.body.ownerId).toBeUndefined();

    const validate = ajv.compile(orderSchema);
    const valid = validate(res.body);
    expect(valid).toBe(true);
    expect(validate.errors ?? []).toEqual([]);
  });

  it('2. Дефект витоку поля (leakOwnerIdForTest = true): звичайні перевірки полів ПРОХОДЯТЬ', async () => {
    const leakyApp = createApp({ leakOwnerIdForTest: true });
    const token = await login(leakyApp, 'bob@example.com');

    const res = await request(leakyApp)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(makeOrderPayload());

    // Звичайні перевірки не помічають зайвого поля!
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.total).toBeCloseTo(560, 2);
    expect(res.body.tier).toBe('basic');
  });

  it('3. Дефект витоку поля: валідатор JSON Schema ЛОВИТЬ дефект завдяки additionalProperties: false', async () => {
    const leakyApp = createApp({ leakOwnerIdForTest: true });
    const token = await login(leakyApp, 'bob@example.com');

    const res = await request(leakyApp)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(makeOrderPayload());

    const validate = ajv.compile(orderSchema);
    const valid = validate(res.body);

    // Валідатор вказує на дефект витоку поля:
    expect(valid).toBe(false);
    expect(validate.errors).toBeDefined();
    expect(validate.errors![0].keyword).toBe('additionalProperties');
    expect(validate.errors![0].params).toEqual({
      additionalProperty: 'ownerId',
    });
  });
});
