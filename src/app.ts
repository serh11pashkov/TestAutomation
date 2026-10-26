import express from 'express';
import { randomUUID } from 'node:crypto';

export type Tier = 'basic' | 'silver' | 'gold';

export interface Item {
  sku: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  ownerId: string;
  tier: Tier;
  items: Item[];
  subtotal: number;
  total: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  tier: Tier;
}

export const USERS: User[] = [
  { id: 'u1', email: 'alice@example.com', password: 'Secret123', tier: 'gold' },
  { id: 'u2', email: 'bob@example.com', password: 'Secret123', tier: 'basic' },
];

const DISCOUNT: Record<Tier, number> = { basic: 0, silver: 0.05, gold: 0.1 };
export const round2 = (n: number) => Math.round(n * 100) / 100;

export function toPublic({ ownerId, ...rest }: Order) {
  return rest;
}

export interface AppOptions {
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  leakOwnerIdForTest?: boolean;
}

export function createApp(options: AppOptions = {}) {
  const {
    rateLimitMax = 5,
    rateLimitWindowMs = 60000,
    leakOwnerIdForTest = false,
  } = options;

  const app = express();
  app.use(express.json());

  const tokens = new Map<string, string>();
  const orders = new Map<string, Order>();

  // Зберігання історії запитів користувача для rate limiter (Варіант № 8)
  const rateLimitMap = new Map<string, number[]>();

  app.post('/auth/login', (req, res) => {
    const user = USERS.find(
      (u) => u.email === req.body?.email && u.password === req.body?.password,
    );
    if (!user) return res.status(401).json({ code: 'INVALID_CREDENTIALS' });

    const token = randomUUID();
    tokens.set(token, user.id);
    res.json({ accessToken: token });
  });

  app.use('/orders', (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = token ? tokens.get(token) : undefined;
    if (!userId) return res.status(401).json({ code: 'UNAUTHORIZED' });

    res.locals.user = USERS.find((u) => u.id === userId);
    next();
  });

  // Варіант № 8: Middleware обмеження частоти створення замовлень (Rate Limiter)
  app.post('/orders', (req, res, next) => {
    const userId = res.locals.user.id;
    const now = Date.now();

    const userTimestamps = rateLimitMap.get(userId) || [];
    const validTimestamps = userTimestamps.filter(
      (ts) => now - ts < rateLimitWindowMs,
    );

    if (validTimestamps.length >= rateLimitMax) {
      const oldest = validTimestamps[0];
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + rateLimitWindowMs - now) / 1000),
      );

      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many orders created. Limit is ${rateLimitMax} orders per minute.`,
        retryAfter: retryAfterSeconds,
      });
    }

    validTimestamps.push(now);
    rateLimitMap.set(userId, validTimestamps);
    next();
  });

  app.post('/orders', (req, res) => {
    const items: Item[] = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ code: 'EMPTY_ORDER' });
    }

    for (const i of items) {
      if (typeof i.price !== 'number' || i.price < 0)
        return res.status(400).json({ code: 'INVALID_PRICE' });
      if (!Number.isInteger(i.qty) || i.qty <= 0)
        return res.status(400).json({ code: 'INVALID_QTY' });
    }

    const user = res.locals.user;
    const subtotal = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
    let rate = DISCOUNT[user.tier as Tier];
    if (subtotal >= 2000) rate += 0.05;
    const afterDiscount = round2(subtotal * (1 - Math.min(rate, 0.25)));
    const total = round2(afterDiscount + (afterDiscount >= 1000 ? 0 : 60));

    const order: Order = {
      id: randomUUID(),
      ownerId: user.id,
      tier: user.tier,
      items,
      subtotal,
      total,
      createdAt: new Date().toISOString(),
    };

    orders.set(order.id, order);

    const responsePayload = leakOwnerIdForTest ? order : toPublic(order);
    res.status(201).location(`/orders/${order.id}`).json(responsePayload);
  });

  app.get('/orders', (_req, res) => {
    const mine = [...orders.values()].filter(
      (o) => o.ownerId === res.locals.user.id,
    );
    res.json(mine.map(toPublic));
  });

  app.get('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== res.locals.user.id) {
      return res.status(404).json({ code: 'NOT_FOUND' });
    }
    res.json(toPublic(order));
  });

  app.delete('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== res.locals.user.id) {
      return res.status(404).json({ code: 'NOT_FOUND' });
    }
    orders.delete(order.id);
    res.status(204).end();
  });

  return app;
}
