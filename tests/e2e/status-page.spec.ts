import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('renders the mobile foundation without detectable accessibility issues', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'AutoCare' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /checking|refresh status/i }),
  ).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
