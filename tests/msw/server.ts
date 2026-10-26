import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const RATE_URL = 'https://api.example.com/rate';
export const CLIENT_API_BASE = 'https://api.crm.example.com';

export const handlers = [
  http.get(RATE_URL, () => HttpResponse.json({ rate: 41.25 })),
  http.get(`${CLIENT_API_BASE}/clients/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: 'Сергій Пашков',
      tier: 'gold',
      isActive: true,
      multiplier: 1.5,
    });
  }),
];

export const server = setupServer(...handlers);
