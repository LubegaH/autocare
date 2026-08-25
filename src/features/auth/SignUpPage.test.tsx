import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { SignUpPage } from './SignUpPage.tsx'

describe('SignUpPage', () => {
  it('preserves values and exposes a recoverable error', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SignUpPage
          action={async () => ({
            success: false,
            error: { code: 'unexpected_error', message: 'Please try again.' },
          })}
        />
      </MemoryRouter>,
    )
    const name = screen.getByRole('textbox', { name: 'Full name' })
    await user.type(name, 'Kato Samuel')
    await user.type(
      screen.getByRole('textbox', { name: 'Phone number' }),
      '0700123456',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Email address' }),
      'kato@example.test',
    )
    await user.type(
      screen.getByLabelText('Password'),
      'correct horse battery staple',
    )
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please try again.',
    )
    expect(name).toHaveValue('Kato Samuel')
  })
})
