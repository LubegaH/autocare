import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { AuthCard, FieldError } from '../auth/AuthCard.tsx'
import { inviteStaff } from './staffInvitationService.ts'

export function StaffInvitePage() {
  const { garageId = '' } = useParams()
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(undefined)
    setFieldErrors(undefined)
    const values = new FormData(event.currentTarget)
    const result = await inviteStaff({
      garageId,
      fullName: String(values.get('fullName') ?? ''),
      phone: String(values.get('phone') ?? ''),
      email: String(values.get('email') ?? ''),
      role: String(values.get('role') ?? ''),
    })
    setPending(false)
    if (!result.success) {
      setMessage(result.error.message)
      setFieldErrors(result.error.fieldErrors)
      return
    }
    setSent(true)
    setMessage(
      'Invitation sent. It expires in 72 hours and can be used only once.',
    )
  }

  return (
    <AuthCard
      eyebrow="Garage access"
      title="Invite a staff member"
      intro="Their name and phone create the required profile only if this is a new AutoCare account."
      footer={
        <p>
          <Link to="/dashboard">Back to dashboard</Link>
        </p>
      }
    >
      <form
        className="auth-form"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        <label>
          Full name
          <input name="fullName" autoComplete="name" />
          <FieldError messages={fieldErrors?.fullName} />
        </label>
        <label>
          Phone number
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+256 700 123456"
          />
          <FieldError messages={fieldErrors?.phone} />
        </label>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" />
          <FieldError messages={fieldErrors?.email} />
        </label>
        <label>
          Garage role
          <select name="role" defaultValue="mechanic">
            <option value="manager">Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="mechanic">Mechanic</option>
          </select>
          <FieldError messages={fieldErrors?.role} />
        </label>
        <p className="form-hint">
          Managers may invite supervisors and mechanics. Only owners may invite
          another manager.
        </p>
        {message ? (
          <p
            className={`form-message${sent ? '' : ' form-message--error'}`}
            role={sent ? 'status' : 'alert'}
          >
            {message}
          </p>
        ) : null}
        <button
          className="primary-action"
          type="submit"
          disabled={pending || sent}
        >
          {pending
            ? 'Sending invitation…'
            : sent
              ? 'Invitation sent'
              : 'Send invitation'}
        </button>
      </form>
    </AuthCard>
  )
}
