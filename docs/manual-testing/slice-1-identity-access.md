# Slice 1 manual test — identity and delegated access

Use this guide before agent review to inspect the front-facing Slice 1 work. It uses the dedicated synthetic Supabase development project already configured in `.env`; local Docker is not required.

Do not enter real customer, staff, vehicle, or financial information. Use only synthetic `example.test` identities and test phone numbers.

## Current manual-test boundary

- The hosted development database has all Slice 1 migrations.
- `.env` points the browser app at that development project.
- The `identity-invitations` Edge Function is **not deployed** to the hosted project. Staff/customer invitation submission must therefore fail safely and retain no active invitation.
- The complete invitation email, acceptance, customer claim, finance grant, and immediate-revocation workflow passed in the disposable GitHub Actions environment.

## 1. Start the front end

From the repository root:

```bash
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. Do not run `npm run db:start`; the configured hosted development project is being used.

## 2. Review public and failure-state screens

Open each route directly and record anything confusing, clipped, or visually inconsistent:

| Route | Expected result |
| --- | --- |
| `/sign-up` | Name, Ugandan/E.164 phone, email, and password fields. There is no staff-role selector. |
| `/sign-in` | Email/password sign-in plus a recovery link. |
| `/recover` | Copy does not disclose whether an email address exists. |
| `/account` | Signed-out, loading, error, or signed-in account state; no sensitive details. |
| `/invitations/staff/accept?token=invalid` | A human-readable invalid-link alert. |
| `/claims/customer/redeem?token=invalid` | A human-readable invalid-claim alert. |

Repeat the visual pass at approximately 360 px, 768 px, and desktop width. Check that:

- no horizontal scrolling or clipped controls appear;
- labels remain associated with inputs;
- buttons and links are comfortably tappable;
- keyboard Tab order follows the visual order;
- pending, error, and success messages are readable and do not erase form entries unnecessarily.

## 3. Create and verify a synthetic owner

1. Go to `/sign-up`.
2. Enter a unique synthetic identity, for example:
   - Full name: `Manual Test Owner`
   - Phone: `+256 700 000051`
   - Email: `manual-owner-<today>@example.test`
   - Password: a unique test password of 10–72 characters
3. Submit. Expect an instruction to verify the email before signing in.
4. In the Supabase dashboard for the dedicated development project, open **Authentication → Users** and manually confirm this synthetic user's email if no test email was delivered. Do not create the user directly in the dashboard—the sign-up request supplies mandatory profile metadata.
5. Return to `/sign-in` and sign in. Expect navigation to `/dashboard`.

Check these negative cases as well:

- malformed email;
- short password;
- malformed phone number;
- incorrect sign-in password;
- unconfirmed email sign-in.

Each should produce a recoverable message without exposing internal error details.

## 4. Complete owner onboarding

1. From the empty dashboard, choose **Set up a garage**.
2. Enter:
   - Garage name: `Manual Test Garage`
   - Garage phone: `+256 700 000052`
3. Submit once, then use the browser Back/Forward controls and refresh the dashboard.
4. Expect one garage, role `owner`, and links for **Invite staff**, **Link customer**, and **Finance access**.
5. Copy the garage UUID from one of those link URLs for the route checks below.

Review the dashboard's loading, empty, error, and populated presentation. A refresh must not create another garage.

## 5. Review owner access screens

Using the real garage UUID from the dashboard:

### Staff invitation

1. Open `/garages/<garage-id>/staff/invite`.
2. Confirm the form collects name, phone, email, and one of manager/supervisor/mechanic.
3. Confirm the copy explains that managers cannot invite another manager.
4. Submit synthetic valid data.
5. Because the hosted Edge Function is not deployed, expect a recoverable delivery error and no success state.

### Customer claim

1. Open `/garages/<garage-id>/customers/claim`.
2. Confirm the copy explicitly says email matching alone grants no access.
3. Submit synthetic valid data.
4. Expect the same safe delivery error while the hosted function remains undeployed.

### Finance access

1. Open `/garages/<garage-id>/access/finance`.
2. With no accepted supervisor, expect **No eligible supervisors**.
3. Confirm the page says delegated supervisors cannot delegate onward.

## 6. Optional full hosted invitation test

Do this only after separately approving deployment to the dedicated development project. It requires:

- deployment of `supabase/functions/identity-invitations`;
- `APP_URL=http://127.0.0.1:5173` configured as an Edge Function secret;
- the local app URL added to the hosted Auth redirect allow-list;
- working hosted Auth email delivery for new identities;
- Resend secrets if testing invitations to accounts that already exist.

Once configured, manually verify this sequence with two private-browser sessions:

1. Owner invites a new supervisor and sees a 72-hour, single-use success message.
2. Supervisor opens the email, creates a password, accepts, and sees the garage with role `supervisor`.
3. Owner grants `finance_admin` with a reason; the supervisor becomes active in the finance list.
4. Owner revokes it with a reason; the UI immediately shows no finance access.
5. Owner issues a customer claim to a new customer email.
6. Customer opens the email, creates a password, and explicitly links the record.
7. Reopening either consumed link fails closed.
8. A different signed-in email cannot redeem either link.

## 7. Record review findings

For each finding, capture:

- route and viewport;
- exact action taken;
- expected and actual result;
- screenshot if visual;
- whether refreshing reproduces it;
- severity: blocker, important, or polish.

Do not include passwords, tokens, publishable/service keys, or real personal information in screenshots or issue text.
