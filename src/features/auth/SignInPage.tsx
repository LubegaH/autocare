import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import type { Result } from '../../shared/types/result.ts'
import { AuthCard, FieldError } from './AuthCard.tsx'
import { signIn } from './authService.ts'
import type { SignInInput } from './authSchemas.ts'
import type { AuthSession } from './authGateway.ts'

type SignInPageProps = {
  action?: (input: SignInInput) => Promise<Result<AuthSession>>
}

export function SignInPage({ action = signIn }: SignInPageProps) {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(undefined)
    setFieldErrors(undefined)
    const values = new FormData(event.currentTarget)
    const result = await action({
      email: String(values.get('email') ?? ''),
      password: String(values.get('password') ?? ''),
    })
    setPending(false)
    if (!result.success) {
      setMessage(result.error.message)
      setFieldErrors(result.error.fieldErrors)
      return
    }
    void navigate('/account')
  }

  return (
    <AuthCard
      eyebrow="Secure access"
      title="Sign in"
      intro="Use your verified AutoCare email and password."
      footer={
        <p>
          New customer or garage owner?{' '}
          <Link to="/sign-up">Create an account</Link>
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
          <FieldError messages={fieldErrors?.email} />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
          />
          <FieldError messages={fieldErrors?.password} />
        </label>
        {message ? (
          <p className="form-message form-message--error" role="alert">
            {message}
          </p>
        ) : null}
        <button className="primary-action" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        <Link className="text-link" to="/recover">
          Forgot your password?
        </Link>
      </form>
    </AuthCard>
  )
}
