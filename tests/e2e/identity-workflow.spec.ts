import { createClient } from '@supabase/supabase-js'
import { expect, test, type Page } from '@playwright/test'
import { z } from 'zod'

const mailpitListSchema = z.object({
  messages: z.array(
    z.object({
      ID: z.string().min(1),
      To: z.array(z.object({ Address: z.email() })),
    }),
  ),
})
const mailpitMessageSchema = z.object({ HTML: z.string().min(1) })
const membershipSchema = z.object({ garage_id: z.uuid() })

const mailpitUrl = 'http://127.0.0.1:54324'
const password = 'Slice1-test-password-42'

async function signIn(page: Page, email: string) {
  await page.goto('/sign-in')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

async function invitationUrlFor(email: string) {
  let messageId: string | undefined
  await expect
    .poll(
      async () => {
        const response = await fetch(`${mailpitUrl}/api/v1/messages`)
        if (!response.ok) return false
        const parsed = mailpitListSchema.safeParse(await response.json())
        if (!parsed.success) return false
        messageId = parsed.data.messages.find((message) =>
          message.To.some((recipient) => recipient.Address === email),
        )?.ID
        return Boolean(messageId)
      },
      { timeout: 15_000, message: `waiting for invitation to ${email}` },
    )
    .toBe(true)

  const response = await fetch(`${mailpitUrl}/api/v1/message/${messageId}`)
  expect(response.ok).toBe(true)
  const message = mailpitMessageSchema.parse(await response.json())
  const href = [...message.HTML.matchAll(/href="([^"]+)"/g)]
    .map((match) => match[1]?.replaceAll('&amp;', '&'))
    .find((value) => value?.includes('/auth/v1/verify'))
  expect(href).toBeTruthy()
  return z.url().parse(href)
}

test('owner invites identities and immediately revokes delegated finance access', async ({
  browser,
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-1280',
    'The live identity workflow runs once; responsive coverage is separate.',
  )
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  test.skip(
    !supabaseUrl || !serviceRoleKey,
    'A disposable local Supabase service-role environment is required.',
  )

  const admin = createClient(
    z.url().parse(supabaseUrl),
    z.string().min(1).parse(serviceRoleKey),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
  const suffix = crypto.randomUUID().slice(0, 8)
  const ownerEmail = `owner-${suffix}@example.test`
  const staffEmail = `supervisor-${suffix}@example.test`
  const customerEmail = `customer-${suffix}@example.test`

  await fetch(`${mailpitUrl}/api/v1/messages`, { method: 'DELETE' })
  const ownerResult = await admin.auth.admin.createUser({
    email: ownerEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'CI Garage Owner',
      phone_e164: '+256700000041',
    },
  })
  expect(ownerResult.error).toBeNull()
  const ownerId = z.uuid().parse(ownerResult.data.user?.id)

  await signIn(page, ownerEmail)
  await page.goto('/onboarding/garage')
  await page.getByLabel('Garage name').fill(`CI Garage ${suffix}`)
  await page.getByLabel('Garage phone').fill('+256700000042')
  await page.getByRole('button', { name: 'Create garage' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  const membershipResult = await admin
    .from('garage_memberships')
    .select('garage_id')
    .eq('user_id', ownerId)
    .single()
  expect(membershipResult.error).toBeNull()
  const garageId = membershipSchema.parse(membershipResult.data).garage_id

  await page.goto(`/garages/${garageId}/staff/invite`)
  await page.getByLabel('Full name').fill('CI Supervisor')
  await page.getByLabel('Phone number').fill('+256700000043')
  await page.getByLabel('Email address').fill(staffEmail)
  await page.getByLabel('Garage role').selectOption('supervisor')
  await page.getByRole('button', { name: 'Send invitation' }).click()
  await expect(page.getByRole('status')).toContainText('Invitation sent')

  const staffContext = await browser.newContext()
  const staffPage = await staffContext.newPage()
  await staffPage.goto(await invitationUrlFor(staffEmail))
  await expect(
    staffPage.getByRole('heading', { name: 'Join the garage' }),
  ).toBeVisible()
  await staffPage.getByLabel('Create password').fill(password)
  await staffPage.getByRole('button', { name: 'Set password & join' }).click()
  await expect(staffPage).toHaveURL(/\/dashboard$/)

  await page.goto(`/garages/${garageId}/customers/claim`)
  await page.getByLabel('Customer full name').fill('CI Customer')
  await page.getByLabel('Customer phone').fill('+256700000044')
  await page.getByLabel('Customer email').fill(customerEmail)
  await page.getByRole('button', { name: 'Send customer claim' }).click()
  await expect(page.getByRole('status')).toContainText('Customer claim sent')

  const customerContext = await browser.newContext()
  const customerPage = await customerContext.newPage()
  await customerPage.goto(await invitationUrlFor(customerEmail))
  await expect(
    customerPage.getByRole('heading', { name: 'Link your customer record' }),
  ).toBeVisible()
  await customerPage.getByLabel('Create password').fill(password)
  await customerPage
    .getByRole('button', { name: 'Set password & link record' })
    .click()
  await expect(customerPage).toHaveURL(/\/dashboard$/)

  await page.goto(`/garages/${garageId}/access/finance`)
  await expect(page.getByText('CI Supervisor')).toBeVisible()
  await page.getByLabel('Reason').fill('Cover owner absence')
  await page.getByRole('button', { name: 'Grant access' }).click()
  await expect(page.getByText('Finance access active')).toBeVisible()
  await page.getByLabel('Reason').fill('Owner returned')
  await page.getByRole('button', { name: 'Revoke access' }).click()
  await expect(page.getByText('No finance access')).toBeVisible()

  const activeGrant = await admin
    .from('membership_capability_grants')
    .select('grant_id')
    .eq('garage_id', garageId)
    .is('revoked_at', null)
  expect(activeGrant.error).toBeNull()
  expect(activeGrant.data).toEqual([])

  await Promise.all([staffContext.close(), customerContext.close()])
})
