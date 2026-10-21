import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  mergeItems,
  type OrderItem,
} from './order';

console.log('====================================================');
console.log('ДЕМОНСТРАЦІЯ МОДУЛЯ order.ts (ЛАБОРАТОРНА 2, ВАРІАНТ 8)');
console.log('====================================================\n');

// 1. Демонстрація базових функцій (Частина 1)
const sampleItems: OrderItem[] = [
  { sku: 'BOOK-1', price: 250, qty: 2 },
  { sku: 'PEN-4', price: 30, qty: 5 },
  { sku: 'NOTEBOOK-A', price: 120, qty: 3 },
];

const subtotal = calcSubtotal(sampleItems);
console.log('--- Частина 1: Розрахунок замовлення ---');
console.log('Позиції:', sampleItems);
console.log(`Підсумок (subtotal): ${subtotal} грн`);

const discountGold = calcDiscountRate('gold', subtotal);
console.log(`Ставка знижки (gold): ${discountGold * 100}%`);

const shipping = calcShipping(subtotal * (1 - discountGold));
console.log(`Вартість доставки: ${shipping} грн`);

const total = calcOrderTotal(sampleItems, 'gold');
console.log(`Загальна сума до сплати: ${total} грн\n`);

// 2. Демонстрація mergeItems (Частина 2, Варіант 8)
console.log('--- Частина 2: Варіант 8 (mergeItems) ---');
const unmergedItems: OrderItem[] = [
  { sku: 'COFFEE-ARABICA', price: 180, qty: 2 },
  { sku: 'TEA-GREEN', price: 95, qty: 1 },
  { sku: 'COFFEE-ARABICA', price: 180, qty: 3 },
  { sku: 'SUGAR-CUBE', price: 40, qty: 1 },
  { sku: 'TEA-GREEN', price: 95, qty: 2 },
];

console.log('Вхідний список із дублікатами SKU:');
console.table(unmergedItems);

const merged = mergeItems(unmergedItems);
console.log('Результат виконання mergeItems:');
console.table(merged);

console.log('Обчислення суми після злиття:');
const totalMerged = calcOrderTotal(merged, 'silver');
console.log(
  `Разом до сплати після злиття для silver-клієнта: ${totalMerged} грн`,
);
