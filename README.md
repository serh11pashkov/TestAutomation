# Лабораторна робота №7: Складні сценарії взаємодії з інтерфейсом

**Виконав:** Пашков Сергій Андрійович  
**Група:** ІПЗ-2-2  
**Варіант:** 8

---

## Опис проекту
Автоматизація складних сценаріїв взаємодії з UI на базі **Playwright** та **TypeScript** для навчального стенду [The Internet](https://the-internet.herokuapp.com).

### Реалізовані тести:
1. **Елементи форм (`tests/forms.spec.ts`)**: випадні списки (`/dropdown`), прапорці через `check()`/`uncheck()` (`/checkboxes`), повзунок (`/horizontal_slider`).
2. **Таблиці (`tests/tables.spec.ts`)**: підрахунок рядків, пошук рядка, перевірка сортування стовпця та підрахунок суми (`/tables`).
3. **Браузерні діалоги (`tests/dialogs.spec.ts`)**: `alert`, `confirm`, `prompt` через `page.once('dialog', ...)` (`/javascript_alerts`).
4. **Робота з файлами (`tests/files.spec.ts`)**: вивантаження файлу через `setInputFiles` (`/upload`) та завантаження через `page.waitForEvent('download')` (`/download`).
5. **Нові вкладки (`tests/windows.spec.ts`)**: перехоплення події `context.waitForEvent('page')` (`/windows`).
6. **Фрейми (`tests/frames.spec.ts`)**: робота з вбудованим фреймом через `frameLocator()` (`/iframe`).
7. **Динамічний вміст (`tests/dynamic-loading.spec.ts`)**: очікування появи елемента та приховування індикатора без явних пауз (`/dynamic_loading/2`).
8. **Індивідуальне завдання (Варіант 8) (`tests/variant8-key-presses.spec.ts`)**: надсилання 5 різних клавіш та перевірка відповідного повідомлення (`/key_presses`).

---

## Запуск тестів
```bash
npm install
npx playwright test
npx playwright show-report
```
