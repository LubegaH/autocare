# ADR-0003: Use verified email/password authentication with Resend

Date: 2026-08-14
Status: Accepted

## Context

The near-zero-cost pilot requires verified identities and automated notifications without paid SMS. Email adoption in Ugandan garages remains an explicit pilot assumption, while a valid phone number is still required for calls, WhatsApp sharing, and later phone-based identity. Approving revised repair costs is sensitive and must be attributable. Sending a magic link for every sign-in would increase dependency on email delivery and consume the pilot email allowance quickly.

## Options considered

- Email magic link or one-time code for every sign-in: avoids passwords but makes every login depend on timely email and increases message volume.
- Verified email and password: uses fewer emails and is supported directly by Supabase Auth, but introduces password setup and recovery friction.
- Phone OTP through SMS or WhatsApp: best matches common phone use, but adds paid messaging and provider integration outside the MVP constraint.

## Decision

Use Supabase Auth with verified email and password for staff and customers, with Resend as custom SMTP. Garage owners invite staff and assign garage roles; there is no public staff-role signup. Customers may create accounts, but linking an account to an existing garage customer or vehicle record requires a one-time invitation or explicit claim flow—never an email-string match alone. A valid phone number is mandatory profile data but remains unverified during the pilot.

Email may notify a customer that approval is required, but approving or rejecting work occurs in an authenticated, authorized application session against a specific quotation revision. An approval received by phone or in person may be recorded by authorized staff, but its method and recording staff member remain distinguishable from direct customer approval. Apply rate limits and abuse protection to signup, login, recovery, invitation, and approval flows.

Use Resend's free allowance for authentication and essential transactional messages only. Avoid marketing email and unnecessary progress notifications. Monitor daily and monthly delivery volume, failures, bounces, and the percentage of users who complete verification.

## Consequences

- The pilot avoids paid SMS and can operate within a small transactional-email allowance.
- Users must remember passwords, and recovery still depends on email delivery.
- Staff invitation and customer claim flows require careful expiry, single-use, and audit behavior.
- Email verification does not verify the required phone number; the product must not imply otherwise.
- Revisit when email adoption prevents workflow completion, messages approach 80 per day or 2,400 per month, or phone/WhatsApp verification becomes affordable and operationally justified.
