import { calcMobileBill } from './mobileBilling';

console.log(
  '=== Демонстрація розрахунку тарифу мобільного зв’язку (Варіант 8) ===\n',
);

const scenarios = [
  { desc: 'Без дзвінків (тільки абонплата)', minutes: 0 },
  { desc: 'У межах пакету (50 хв)', minutes: 50 },
  { desc: 'Межове значення пакету (100 хв)', minutes: 100 },
  {
    desc: 'Понад ліміт (120 хв: 100 хв пакет + 20 хв * 0.5 грн)',
    minutes: 120,
  },
  {
    desc: 'Пакет + 10 хв міжнародних (100 хв стандарт + 10 хв * 3 грн)',
    minutes: 100,
    opts: { internationalMinutes: 10 },
  },
  {
    desc: 'Комплексний (150 хв стандарт + 20 хв міжнародних)',
    minutes: 150,
    opts: { internationalMinutes: 20 },
  },
  {
    desc: 'Знижка лояльності 10% (100 хв стандартних)',
    minutes: 100,
    opts: { loyaltyDiscount: true },
  },
  {
    desc: 'Знижка лояльності 10% (150 хв стандарт + 20 хв міжнародних)',
    minutes: 150,
    opts: { internationalMinutes: 20, loyaltyDiscount: true },
  },
];

for (const sc of scenarios) {
  const result = calcMobileBill(sc.minutes, sc.opts);
  console.log(`- ${sc.desc}:`);
  console.log(
    `  Параметри: minutes=${sc.minutes}, options=${JSON.stringify(sc.opts ?? {})}`,
  );
  console.log(`  До сплати: ${result.toFixed(2)} грн\n`);
}
