import type { ReactNode } from 'react'
import { Link } from 'react-router'

type AuthCardProps = {
  eyebrow: string
  title: string
  intro: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <header className="auth-card__header">
          <Link className="brand-link" to="/">
            AutoCare
          </Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-title">{title}</h1>
          <p>{intro}</p>
        </header>
        <div className="auth-card__body">{children}</div>
        <footer className="auth-card__footer">{footer}</footer>
      </section>
    </main>
  )
}

export function FieldError({ messages }: { messages: string[] | undefined }) {
  return messages?.length ? (
    <span className="field-error">{messages[0]}</span>
  ) : null
}
