import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ResetPasswordPage } from './ResetPasswordPage.tsx'

describe('ResetPasswordPage', () => {
  it('lets a recovery session set a new password', async () => {
    const update = vi.fn().mockResolvedValue({ success: true, data: null })
    render(
      <MemoryRouter>
        <ResetPasswordPage
          load={async () => ({
            success: true,
            data: {
              userId: 'user-1',
              email: 'customer@example.test',
              invitedAt: null,
            },
          })}
          update={update}
        />
      </MemoryRouter>,
    )

    await userEvent.type(
      await screen.findByLabelText('New password'),
      'a-new-secure-password',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save password' }))

    expect(update).toHaveBeenCalledWith('a-new-secure-password')
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your password has been updated.',
    )
  })

  it('does not offer a password form without a valid session', async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage load={async () => ({ success: true, data: null })} />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'expired or is invalid',
    )
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
  })
})
