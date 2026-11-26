import { test, expect } from '@playwright/test';

test.describe('Таблиця даних', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tables');
  });

  test('таблиця містить очікувану кількість рядків', async ({ page }) => {
    await expect(page.locator('#table1 tbody tr')).toHaveCount(4);
  });

  test('пошук рядка за вмістом комірки', async ({ page }) => {
    const row = page
      .locator('#table1 tbody tr')
      .filter({ hasText: 'Conway' });

    await expect(row.locator('td').nth(2)).toHaveText('tconway@earthlink.net');
    await expect(row.locator('td').nth(3)).toHaveText('$50.00');
  });

  test('сортування за прізвищем упорядковує стовпець', async ({ page }) => {
    await expect(page.locator('#table1 tbody tr')).toHaveCount(4);
    await page.locator('#table1 thead th').first().click();

    const names = await page
      .locator('#table1 tbody tr td:first-child')
      .allTextContents();

    expect(names).toEqual([...names].sort());
  });

  test('сума значень стовпця відповідає очікуваній', async ({ page }) => {
    await expect(page.locator('#table1 tbody tr')).toHaveCount(4);
    const amounts = await page
      .locator('#table1 tbody tr td:nth-child(4)')
      .allTextContents();

    const total = amounts
      .map((t) => Number(t.replace('$', '')))
      .reduce((sum, n) => sum + n, 0);

    expect(total).toBeCloseTo(251.0, 2);
  });
});
