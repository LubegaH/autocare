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

test('staff invitation form collects mandatory profile data accessibly', async ({
  page,
}) => {
  await page.goto('/garages/41000000-0000-4000-8000-000000000001/staff/invite')

  await expect(
    page.getByRole('heading', { name: 'Invite a staff member' }),
  ).toBeVisible()
  await expect(page.getByLabel('Phone number')).toBeVisible()
  await expect(page.getByLabel('Garage role')).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('invalid invitation links fail closed', async ({ page }) => {
  await page.goto('/invitations/staff/accept?token=invalid')

  await expect(page.getByRole('alert')).toContainText('invalid')
})

test('customer claim issuance explains explicit linking accessibly', async ({
  page,
}) => {
  await page.goto(
    '/garages/50000000-0000-4000-8000-000000000001/customers/claim',
  )

  await expect(
    page.getByRole('heading', {
      name: 'Invite a customer to claim their record',
    }),
  ).toBeVisible()
  await expect(page.getByText(/Email matching alone/)).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('invalid customer claim links fail closed', async ({ page }) => {
  await page.goto('/claims/customer/redeem?token=invalid')
  await expect(page.getByRole('alert')).toContainText('invalid')
})
