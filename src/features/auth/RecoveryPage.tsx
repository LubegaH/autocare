import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { Result } from '../../shared/types/result.ts'
import { AuthCard, FieldError } from './AuthCard.tsx'
import { requestRecovery } from './authService.ts'
import type { RecoveryInput } from './authSchemas.ts'

type RecoveryPageProps = {
  action?: (input: RecoveryInput) => Promise<Result<null>>
}

export function RecoveryPage({ action = requestRecovery }: RecoveryPageProps) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string[]>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(undefined)
    setError(undefined)
    const values = new FormData(event.currentTarget)
    const result = await action({ email: String(values.get('email') ?? '') })
    setPending(false)
    setMessage(
      result.success
        ? 'If an account exists for that email, recovery instructions are on the way.'
        : result.error.message,
    )
    if (!result.success) setError(result.error.fieldErrors?.email)
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Reset your password"
      intro="We will send a single-use recovery link if the account exists."
      footer={
        <p>
          <Link to="/sign-in">Back to sign in</Link>
        </p>
      }
    >
      <form
        className="auth-form"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" />
          <FieldError messages={error} />
        </label>
        {message ? (
          <p className="form-message" role="status">
            {message}
          </p>
        ) : null}
        <button className="primary-action" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send recovery email'}
        </button>
      </form>
    </AuthCard>
  )
}
