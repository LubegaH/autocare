import { useState, type FormEvent } from 'react'
import { FieldError } from '../auth/AuthCard.tsx'
import {
  issueCustomerClaim,
  searchClaimableCustomers,
  type ClaimableCustomer,
} from './customerClaimService.ts'

type Props = {
  garageId: string
  search?: typeof searchClaimableCustomers
  issue?: typeof issueCustomerClaim
}

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; customers: ClaimableCustomer[] }

export function ExistingCustomerClaimForm({
  garageId,
  search = searchClaimableCustomers,
  issue = issueCustomerClaim,
}: Props) {
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({ kind: 'idle' })
  const [selectedId, setSelectedId] = useState('')
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState<string>()
  const [emailError, setEmailError] = useState<string[]>()

  const selected =
    searchState.kind === 'ready'
      ? searchState.customers.find(
          (customer) => customer.customer_id === selectedId,
        )
      : undefined

  async function find(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (searchState.kind === 'loading' || pending) return
    setSelectedId('')
    setEmail('')
    setMessage(undefined)
    setEmailError(undefined)
    setSent(false)
    setSearchState({ kind: 'loading' })
    const result = await search(garageId, query)
    setSearchState(
      result.success
        ? result.data.length
          ? { kind: 'ready', customers: result.data }
          : { kind: 'empty' }
        : { kind: 'error', message: result.error.message },
    )
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || pending) return
    setPending(true)
    setMessage(undefined)
    setEmailError(undefined)
    const result = await issue({
      garageId,
      fullName: selected.full_name,
      phone: selected.phone_e164,
      email,
      creationKey: selected.creation_key,
    })
    setPending(false)
    if (!result.success) {
      setMessage(result.error.message)
      setEmailError(result.error.fieldErrors?.email)
      return
    }
    setSent(true)
    setMessage('Claim sent for the selected customer record.')
  }

  return (
    <>
      <form className="auth-form" onSubmit={(event) => void find(event)}>
        <label>
          Find customer by name or phone
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <button
          className="primary-action"
          disabled={searchState.kind === 'loading'}
        >
          {searchState.kind === 'loading' ? 'Searching…' : 'Find customer'}
        </button>
      </form>
      {searchState.kind === 'empty' ? (
        <p role="status">
          No unlinked customers matched. Try another name or create a new
          record.
        </p>
      ) : null}
      {searchState.kind === 'error' ? (
        <p className="form-message form-message--error" role="alert">
          {searchState.message}
        </p>
      ) : null}
      {searchState.kind === 'ready' ? (
        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          <label>
            Existing customer
            <select
              value={selectedId}
              onChange={(event) => {
                const id = event.target.value
                const customer = searchState.customers.find(
                  (match) => match.customer_id === id,
                )
                setSelectedId(id)
                setEmail(customer?.email ?? '')
                setMessage(undefined)
              }}
              required
            >
              <option value="">Choose a customer</option>
              {searchState.customers.map((customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name} — {customer.phone_e164}
                </option>
              ))}
            </select>
          </label>
          {selected ? (
            <>
              <label>
                Claim email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <FieldError messages={emailError} />
              </label>
              <p className="form-hint">
                Send the claim to the customer’s verified email. This does not
                change the stored contact email.
              </p>
              {message ? (
                <p
                  className={`form-message${sent ? '' : ' form-message--error'}`}
                  role={sent ? 'status' : 'alert'}
                >
                  {message}
                </p>
              ) : null}
              <button className="primary-action" disabled={pending || sent}>
                {pending
                  ? 'Sending claim…'
                  : sent
                    ? 'Claim sent'
                    : 'Send customer claim'}
              </button>
            </>
          ) : null}
        </form>
      ) : null}
    </>
  )
}
