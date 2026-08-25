import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { AuthCard, FieldError } from '../auth/AuthCard.tsx'
import { createGarage } from './garageService.ts'

export function GarageOnboardingPage() {
  const navigate = useNavigate()
  const [creationKey] = useState(() => crypto.randomUUID())
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(undefined)
    setFieldErrors(undefined)
    const values = new FormData(event.currentTarget)
    const result = await createGarage({
      name: String(values.get('name') ?? ''),
      phone: String(values.get('phone') ?? ''),
      creationKey,
    })
    setPending(false)
    if (!result.success) {
      setMessage(result.error.message)
      setFieldErrors(result.error.fieldErrors)
      return
    }
    void navigate('/dashboard')
  }

  return (
    <AuthCard
      eyebrow="Owner onboarding"
      title="Set up your garage"
      intro="A verified account that completes this step becomes the garage owner."
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
          Garage name
          <input name="name" autoComplete="organization" />
          <FieldError messages={fieldErrors?.name} />
        </label>
        <label>
          Garage phone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+256 700 123456"
          />
          <FieldError messages={fieldErrors?.phone} />
        </label>
        <p className="form-hint">Pilot timezone: Africa/Kampala</p>
        {message ? (
          <p className="form-message form-message--error" role="alert">
            {message}
          </p>
        ) : null}
        <button className="primary-action" type="submit" disabled={pending}>
          {pending ? 'Creating garage…' : 'Create garage'}
        </button>
      </form>
    </AuthCard>
  )
}
