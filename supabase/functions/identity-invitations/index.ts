import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { z } from 'npm:zod@4.4.3'

const identityFields = {
  garageId: z.uuid(),
  fullName: z.string().trim().min(2).max(100),
  phoneE164: z.string().regex(/^\+[1-9][0-9]{7,14}$/),
  email: z.email().transform((value) => value.trim().toLowerCase()),
}
const requestSchema = z.discriminatedUnion('kind', [
  z.object({
    ...identityFields,
    kind: z.literal('staff'),
    role: z.enum(['manager', 'supervisor', 'mechanic']),
  }),
  z.object({
    ...identityFields,
    kind: z.literal('customer'),
    creationKey: z.uuid(),
  }),
])
const staffIssuedSchema = z.object({
  invitation_id: z.uuid(),
  token: z.string().regex(/^[0-9a-f]{64}$/),
})
const customerIssuedSchema = z.object({
  claim_id: z.uuid(),
  customer_id: z.uuid(),
  token: z.string().regex(/^[0-9a-f]{64}$/),
})

function json(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'access-control-allow-headers':
        'authorization, content-type, apikey, x-client-info',
      vary: 'origin',
    },
  })
}

Deno.serve(async (request) => {
  const appUrl = Deno.env.get('APP_URL') ?? 'http://127.0.0.1:5173'
  const allowedOrigin = new URL(appUrl).origin
  const requestOrigin = request.headers.get('origin')
  if (requestOrigin && requestOrigin !== allowedOrigin)
    return json({ error: 'Origin is not allowed.' }, 403, allowedOrigin)
  if (request.method === 'OPTIONS') return json(null, 204, allowedOrigin)
  if (request.method !== 'POST')
    return json({ error: 'Method not allowed.' }, 405, allowedOrigin)

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer '))
    return json({ error: 'Authentication required.' }, 401, allowedOrigin)
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success)
    return json(
      { error: 'Check the invitation details and try again.' },
      400,
      allowedOrigin,
    )

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey)
    return json(
      { error: 'Invitation delivery is not configured.' },
      503,
      allowedOrigin,
    )

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { authorization } },
    auth: { persistSession: false },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const issue =
    parsed.data.kind === 'staff'
      ? await callerClient.rpc('issue_staff_invitation', {
          p_garage_id: parsed.data.garageId,
          p_email: parsed.data.email,
          p_role: parsed.data.role,
          p_expiry_hours: 72,
        })
      : await callerClient.rpc('issue_customer_claim', {
          p_garage_id: parsed.data.garageId,
          p_full_name: parsed.data.fullName,
          p_phone_e164: parsed.data.phoneE164,
          p_email: parsed.data.email,
          p_creation_key: parsed.data.creationKey,
          p_expiry_hours: 72,
        })
  if (issue.error)
    return json(
      { error: 'You cannot issue that invitation.' },
      403,
      allowedOrigin,
    )

  const staffIssued =
    parsed.data.kind === 'staff'
      ? staffIssuedSchema.safeParse(issue.data)
      : undefined
  const customerIssued =
    parsed.data.kind === 'customer'
      ? customerIssuedSchema.safeParse(issue.data)
      : undefined
  if (
    (staffIssued && !staffIssued.success) ||
    (customerIssued && !customerIssued.success)
  ) {
    return json(
      { error: 'The invitation result was invalid.' },
      502,
      allowedOrigin,
    )
  }

  const targetId = staffIssued?.success
    ? staffIssued.data.invitation_id
    : customerIssued?.success
      ? customerIssued.data.claim_id
      : undefined
  const token = staffIssued?.success
    ? staffIssued.data.token
    : customerIssued?.success
      ? customerIssued.data.token
      : undefined
  if (!targetId || !token) {
    return json(
      { error: 'The invitation result was incomplete.' },
      502,
      allowedOrigin,
    )
  }
  const successBody =
    parsed.data.kind === 'staff'
      ? { invitationId: targetId }
      : {
          claimId: targetId,
          customerId: customerIssued?.success
            ? customerIssued.data.customer_id
            : undefined,
        }
  const acceptUrl = new URL(
    parsed.data.kind === 'staff'
      ? '/invitations/staff/accept'
      : '/claims/customer/redeem',
    appUrl,
  )
  acceptUrl.searchParams.set('token', token)

  const revokeAfterFailure = async () => {
    const functionName =
      parsed.data.kind === 'staff'
        ? 'fail_staff_invitation_delivery'
        : 'fail_customer_claim_delivery'
    const argumentName =
      parsed.data.kind === 'staff' ? 'p_invitation_id' : 'p_claim_id'
    await callerClient.rpc(functionName, { [argumentName]: targetId })
  }

  const { error: authInviteError } =
    await adminClient.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: {
        full_name: parsed.data.fullName,
        phone_e164: parsed.data.phoneE164,
      },
      redirectTo: acceptUrl.toString(),
    })
  if (!authInviteError) {
    return json(successBody, 201, allowedOrigin)
  }

  const accountAlreadyExists =
    authInviteError.code === 'email_exists' ||
    authInviteError.code === 'user_already_exists' ||
    authInviteError.status === 422
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const resendFrom = Deno.env.get('RESEND_FROM_EMAIL')
  if (!accountAlreadyExists || !resendApiKey || !resendFrom) {
    await revokeAfterFailure()
    return json(
      { error: 'The invitation email could not be sent.' },
      502,
      allowedOrigin,
    )
  }

  const delivery = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${resendApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [parsed.data.email],
      subject:
        parsed.data.kind === 'staff'
          ? 'You have been invited to AutoCare'
          : 'Link your AutoCare customer record',
      html: `<p>${parsed.data.kind === 'staff' ? 'You have been invited to join a garage' : 'A garage invited you to link your customer record'} in AutoCare.</p><p><a href="${acceptUrl.toString()}">Review invitation</a></p><p>This single-use link expires in 72 hours.</p>`,
    }),
  })
  if (!delivery.ok) {
    await revokeAfterFailure()
    return json(
      { error: 'The invitation email could not be sent.' },
      502,
      allowedOrigin,
    )
  }
  return json(successBody, 201, allowedOrigin)
})
