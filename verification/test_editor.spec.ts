
import { test, expect } from '@playwright/test';

test('verify plan editor', async ({ page }) => {
  // Mock the load/save API
  await page.route('/api/plans', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, json: { id: 1, name: 'Test Plan' } });
    } else {
        await route.fulfill({ status: 200, json: [] });
    }
  });

  await page.goto('http://localhost:5000');

  // Wait for the app to load
  await page.waitForSelector('text=План Эвакуации');

  // Verify basic UI elements
  // Use first() or a more specific locator. The toolbar one is a span.
  await expect(page.locator('span', { hasText: 'План Эвакуации' }).first()).toBeVisible();

  // Check new toolbar buttons
  await expect(page.locator('button').filter({ hasText: 'Сохранить' })).toBeVisible();
  await expect(page.locator('button').filter({ hasText: 'Открыть' })).toBeVisible();

  // Open Save dialog
  await page.click('button:has-text("Сохранить")');
  await expect(page.getByText('Сохранить проект')).toBeVisible();
  await page.screenshot({ path: 'verification/save_dialog.png' });
  await page.click('button:has-text("Отмена")');

  // Open Load dialog
  await page.click('button:has-text("Открыть")');
  await expect(page.getByText('Открыть проект')).toBeVisible();
  await page.screenshot({ path: 'verification/load_dialog.png' });
  await page.click('button:has-text("Close")'); // Shadcn dialog close is typically an X or outside click, but let's try close button if it has one or just escape

  // Select Wall Tool
  // Assuming there is a wall tool button, let's look for icon or title
  // Based on code, PropertiesPanel is on the left. The Toolbar is top.
  // Sidebar.tsx is likely where tools are. Let's assume there is a sidebar.
  // Wait, I missed checking Sidebar.tsx content.
  // Let's verify the main canvas is present
  await expect(page.locator('.konvajs-content')).toBeVisible();
});
