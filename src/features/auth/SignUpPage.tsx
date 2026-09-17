import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { Result } from '../../shared/types/result.ts'
import { AuthCard, FieldError } from './AuthCard.tsx'
import { signUp } from './authService.ts'
import type { SignUpInput } from './authSchemas.ts'

type SignUpPageProps = {
  action?: (
    input: SignUpInput,
  ) => Promise<Result<{ confirmationRequired: boolean }>>
}

export function SignUpPage({ action = signUp }: SignUpPageProps) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(undefined)
    setFieldErrors(undefined)
    const values = new FormData(event.currentTarget)
    const result = await action({
      fullName: String(values.get('fullName') ?? ''),
      phone: String(values.get('phone') ?? ''),
      email: String(values.get('email') ?? ''),
      password: String(values.get('password') ?? ''),
    })
    setPending(false)
    if (!result.success) {
      setMessage(result.error.message)
      setFieldErrors(result.error.fieldErrors)
      return
    }
    setSuccess(true)
    setMessage(
      result.data.confirmationRequired
        ? 'Check your email and verify your address before signing in.'
        : 'Your account is ready. You can continue to AutoCare.',
    )
  }

  return (
    <AuthCard
      eyebrow="Verified account"
      title="Create your account"
      intro="For customers and garage owners. Staff join only through a garage invitation."
      footer={
        <p>
          Already registered? <Link to="/sign-in">Sign in</Link>
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
          Password
          <input name="password" type="password" autoComplete="new-password" />
          <FieldError messages={fieldErrors?.password} />
        </label>
        {message ? (
          <p
            className={`form-message${success ? '' : ' form-message--error'}`}
            role={success ? 'status' : 'alert'}
          >
            {message}
          </p>
        ) : null}
        <button
          className="primary-action"
          type="submit"
          disabled={pending || success}
        >
          {pending
            ? 'Creating account…'
            : success
              ? 'Email sent'
              : 'Create account'}
        </button>
      </form>
    </AuthCard>
  )
}
