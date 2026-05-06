const { test, expect } = require('@playwright/test');

test.describe('Portfolio Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Portfolio/);
  });

  test('shows welcome message', async ({ page }) => {
    await expect(page.locator('.output')).toContainText('Welcome to kenny@portfolio');
  });

  test('basic commands work', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('help');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('Available commands');

    await input.fill('pwd');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('/home/kenny/~');

    await input.fill('whoami');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('kenny');

    await input.fill('date');
    await input.press('Enter');
    const output = await page.locator('.output').textContent();
    expect(output).toMatch(/\d{4}/);
  });

  test('echo command', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('echo hello world');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('hello world');
  });

  test('clear command', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('clear');
    await input.press('Enter');
    await expect(page.locator('.output')).toBeEmpty();
  });

  test('unknown command shows error', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('fake command');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('command not found');
  });

  test('command history with arrow keys', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('help');
    await input.press('Enter');
    await input.fill('pwd');
    await input.press('Enter');

    await input.press('ArrowUp');
    await expect(input).toHaveValue('pwd');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('help');
  });

  test('ls lists files', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('ls');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('about.txt');
    await expect(page.locator('.output')).toContainText('projects/');
  });

  test('nvim shows file contents', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('nvim resume.md');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('Senior Data Engineer');
  });

  test('nvim aliases work (cat, vim, vi)', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('cat resume.md');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('Senior Data Engineer');

    await input.fill('vim resume.md');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('Senior Data Engineer');

    await input.fill('vi resume.md');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('Senior Data Engineer');
  });

  test('cd changes directory', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('cd projects');
    await input.press('Enter');
    await input.fill('pwd');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('projects');

    await input.fill('ls');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('data-pipeline.md');
    await expect(page.locator('.output')).toContainText('etl-tool.md');
  });

  test('cd back to home with ~', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('cd projects');
    await input.press('Enter');
    await input.fill('cd ~');
    await input.press('Enter');
    await input.fill('pwd');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('~');
  });

  test('cd .. goes up', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('cd projects');
    await input.press('Enter');
    await input.fill('cd ..');
    await input.press('Enter');
    await input.fill('pwd');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('~');
  });

  test('cd to invalid path shows error', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('cd fake_directory');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('No such file or directory');
  });

  test('nvim on non-existent file shows error', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('nvim nonexistent.txt');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText('No such file or directory');
  });

  test('nvim about.txt works', async ({ page }) => {
    const input = page.locator('#commandInput');

    await input.fill('nvim about.txt');
    await input.press('Enter');
    await expect(page.locator('.output')).toContainText("I'm Kenny");
    await expect(page.locator('.output')).toContainText('Senior Data Engineer');
  });
});
