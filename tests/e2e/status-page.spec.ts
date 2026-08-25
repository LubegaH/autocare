import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('renders the responsive foundation without detectable accessibility issues', async ({
  page,
}) => {
  const unexpectedConsoleMessages: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      unexpectedConsoleMessages.push(message.text())
    }
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'AutoCare' })).toBeVisible()
  await expect(page.getByText('AutoCare foundation')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Refresh status' }),
  ).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
  expect(unexpectedConsoleMessages).toEqual([])
})
