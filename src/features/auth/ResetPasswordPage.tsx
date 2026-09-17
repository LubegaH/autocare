import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { Result } from '../../shared/types/result.ts'
import { AuthCard } from './AuthCard.tsx'
import type { AuthSession } from './authGateway.ts'
import { loadSession, updatePassword } from './authService.ts'

type Props = {
  load?: () => Promise<Result<AuthSession | null>>
  update?: (password: string) => Promise<Result<null>>
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready' }
  | { kind: 'error'; message: string }
  | { kind: 'updated' }

export function ResetPasswordPage({
  load = loadSession,
  update = updatePassword,
}: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  useEffect(() => {
    void load().then((result) => {
      setState(
        result.success && result.data
          ? { kind: 'ready' }
          : {
              kind: 'error',
              message: result.success
                ? 'This recovery link has expired or is invalid. Request a new one.'
                : result.error.message,
            },
      )
    })
  }, [load])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const password = String(
      new FormData(event.currentTarget).get('password') ?? '',
    )
    setPending(true)
    setMessage(undefined)
    const result = await update(password)
    setPending(false)
    if (result.success) setState({ kind: 'updated' })
    else setMessage(result.error.message)
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Set a new password"
      intro="Choose a new password to finish recovering your account."
      footer={
        <p>
          <Link to="/sign-in">Back to sign in</Link>
        </p>
      }
    >
      {state.kind === 'loading' ? (
        <p role="status">Checking recovery link…</p>
      ) : null}
      {state.kind === 'error' ? (
        <p className="form-message form-message--error" role="alert">
          {state.message}
        </p>
      ) : null}
      {state.kind === 'ready' ? (
        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          <label>
            New password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </label>
          {message ? (
            <p className="form-message form-message--error" role="alert">
              {message}
            </p>
          ) : null}
          <button className="primary-action" disabled={pending}>
            {pending ? 'Saving password…' : 'Save password'}
          </button>
        </form>
      ) : null}
      {state.kind === 'updated' ? (
        <p className="form-message" role="status">
          Your password has been updated. You can now sign in.
        </p>
      ) : null}
    </AuthCard>
  )
}
