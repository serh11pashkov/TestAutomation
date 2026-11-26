# Лабораторна робота №8: Page Object Model, фікстури та тестові дані

**Виконав:** Пашков Сергій Андрійович  
**Група:** ІПЗ-2-2  
**Варіант:** 8

---

## Архітектура проєкту
- `tests/pages/` — Page Object класи (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`) без тверджень (`expect`) і з приватними локаторами.
- `tests/components/` — компонентні об'єкти (`Header`, `ProductCard`), що приймають кореневий `Locator`.
- `tests/fixtures/index.ts` — розширені фікстури Playwright, включаючи `auto`-фікстуру фіксації `faker.seed(...)`.
- `tests/data/factories.ts` — фабрика генерації даних покупця `makeCustomer()`.
- `tests/auth.setup.ts` — одноразова автентифікація зі збереженням стану (`.auth/standard.json` та `.auth/glitch.json`).
- **Варіант 8**: окремий проєкт `performance-glitch` у `playwright.config.ts` для користувача `performance_glitch_user` без збільшення стандартних таймаутів.

## Запуск тестів
```bash
npm install
npx playwright test
npx playwright test --workers=4 --repeat-each=5
```
