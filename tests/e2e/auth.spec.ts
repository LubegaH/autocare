import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('renders accessible account creation without staff-role self-selection', async ({
  page,
}) => {
  await page.goto('/sign-up')

  await expect(
    page.getByRole('heading', { name: 'Create your account' }),
  ).toBeVisible()
  await expect(page.getByLabel('Phone number')).toBeVisible()
  await expect(page.getByText(/Staff join only through/)).toBeVisible()
  await expect(page.getByLabel(/role/i)).toHaveCount(0)

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('recovery does not disclose whether an account exists', async ({
  page,
}) => {
  await page.goto('/recover')

  await expect(page.getByText(/if the account exists/i)).toBeVisible()
})

test('owner onboarding is responsive and accessible', async ({ page }) => {
  await page.goto('/onboarding/garage')

  await expect(
    page.getByRole('heading', { name: 'Set up your garage' }),
  ).toBeVisible()
  await expect(page.getByText('Africa/Kampala')).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
