import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { AuthCard, FieldError } from '../auth/AuthCard.tsx'
import { issueCustomerClaim } from './customerClaimService.ts'

export function CustomerClaimPage() {
  const { garageId = '' } = useParams()
  const [creationKey] = useState(() => crypto.randomUUID())
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
    const result = await issueCustomerClaim({
      garageId,
      fullName: String(values.get('fullName') ?? ''),
      phone: String(values.get('phone') ?? ''),
      email: String(values.get('email') ?? ''),
      creationKey,
    })
    setPending(false)
    if (!result.success) {
      setMessage(result.error.message)
      setFieldErrors(result.error.fieldErrors)
      return
    }
    setSent(true)
    setMessage(
      'Customer claim sent. Email matching alone has not linked the record.',
    )
  }

  return (
    <AuthCard
      eyebrow="Customer access"
      title="Invite a customer to claim their record"
      intro="Email matching alone grants no access. The customer must verify the invited email, sign in, and redeem the single-use claim."
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
          Customer full name
          <input name="fullName" autoComplete="name" />
          <FieldError messages={fieldErrors?.fullName} />
        </label>
        <label>
          Customer phone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+256 700 123456"
          />
          <FieldError messages={fieldErrors?.phone} />
        </label>
        <label>
          Customer email
          <input name="email" type="email" autoComplete="email" />
          <FieldError messages={fieldErrors?.email} />
        </label>
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
            ? 'Sending claim…'
            : sent
              ? 'Claim sent'
              : 'Send customer claim'}
        </button>
      </form>
    </AuthCard>
  )
}
