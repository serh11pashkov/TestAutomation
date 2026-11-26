import { test, expect } from '@playwright/test';

test.describe('Варіант 8: Натискання клавіш (/key_presses)', () => {
  const keyScenarios = [
    { key: 'Escape', expectedText: 'You entered: ESCAPE' },
    { key: 'Space', expectedText: 'You entered: SPACE' },
    { key: 'Tab', expectedText: 'You entered: TAB' },
    { key: 'Shift', expectedText: 'You entered: SHIFT' },
    { key: 'Backspace', expectedText: 'You entered: BACK_SPACE' },
  ];

  test('надсилання п’яти різних клавіш та перевірка повідомлень', async ({
    page,
  }) => {
    await page.goto('/key_presses');

    const result = page.locator('#result');

    for (const scenario of keyScenarios) {
      await page.keyboard.press(scenario.key);
      await expect(result).toHaveText(scenario.expectedText);
    }
  });
});
