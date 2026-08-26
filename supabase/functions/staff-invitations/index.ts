import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { z } from 'npm:zod@4.4.3'

const requestSchema = z.object({
  garageId: z.uuid(),
  fullName: z.string().trim().min(2).max(100),
  phoneE164: z.string().regex(/^\+[1-9][0-9]{7,14}$/),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  role: z.enum(['manager', 'supervisor', 'mechanic']),
})

const issuedInvitationSchema = z.object({
  invitation_id: z.uuid(),
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

async function sendExistingUserEmail(input: {
  apiKey: string
  from: string
  email: string
  acceptUrl: string
}) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${input.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.email],
      subject: 'You have been invited to AutoCare',
      html: `<p>You have been invited to join a garage in AutoCare.</p><p><a href="${input.acceptUrl}">Review invitation</a></p><p>This single-use invitation expires in 72 hours.</p>`,
    }),
  })
}

Deno.serve(async (request) => {
  const appUrl = Deno.env.get('APP_URL') ?? 'http://127.0.0.1:5173'
  const requestOrigin = request.headers.get('origin')
  const allowedOrigin = new URL(appUrl).origin

  if (requestOrigin && requestOrigin !== allowedOrigin) {
    return json({ error: 'Origin is not allowed.' }, 403, allowedOrigin)
  }

  if (request.method === 'OPTIONS') return json(null, 204, allowedOrigin)
  if (request.method !== 'POST')
    return json({ error: 'Method not allowed.' }, 405, allowedOrigin)

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Authentication required.' }, 401, allowedOrigin)
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return json(
      { error: 'Check the invitation details and try again.' },
      400,
      allowedOrigin,
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(
      { error: 'Invitation delivery is not configured.' },
      503,
      allowedOrigin,
    )
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { authorization } },
    auth: { persistSession: false },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: issuedData, error: issueError } = await callerClient.rpc(
    'issue_staff_invitation',
    {
      p_garage_id: parsed.data.garageId,
      p_email: parsed.data.email,
      p_role: parsed.data.role,
      p_expiry_hours: 72,
    },
  )
  const issued = issuedInvitationSchema.safeParse(issuedData)
  if (issueError || !issued.success) {
    return json(
      { error: 'You cannot issue that invitation.' },
      403,
      allowedOrigin,
    )
  }

  const acceptUrl = new URL('/invitations/staff/accept', appUrl)
  acceptUrl.searchParams.set('token', issued.data.token)

  const revokeAfterFailure = async () => {
    await callerClient.rpc('fail_staff_invitation_delivery', {
      p_invitation_id: issued.data.invitation_id,
    })
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
    return json({ invitationId: issued.data.invitation_id }, 201, allowedOrigin)
  }

  const accountAlreadyExists =
    authInviteError.code === 'email_exists' ||
    authInviteError.code === 'user_already_exists' ||
    authInviteError.status === 422

  if (!accountAlreadyExists) {
    await revokeAfterFailure()
    return json(
      { error: 'The invitation email could not be sent.' },
      502,
      allowedOrigin,
    )
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const resendFrom = Deno.env.get('RESEND_FROM_EMAIL')
  if (!resendApiKey || !resendFrom) {
    await revokeAfterFailure()
    return json(
      { error: 'Existing-user invitation email is not configured.' },
      503,
      allowedOrigin,
    )
  }

  const delivery = await sendExistingUserEmail({
    apiKey: resendApiKey,
    from: resendFrom,
    email: parsed.data.email,
    acceptUrl: acceptUrl.toString(),
  })
  if (!delivery.ok) {
    await revokeAfterFailure()
    return json(
      { error: 'The invitation email could not be sent.' },
      502,
      allowedOrigin,
    )
  }

  return json({ invitationId: issued.data.invitation_id }, 201, allowedOrigin)
})
