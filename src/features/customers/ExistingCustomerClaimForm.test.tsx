import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ExistingCustomerClaimForm } from './ExistingCustomerClaimForm.tsx'

const garageId = '50000000-0000-4000-8000-000000000001'
const customerId = '52000000-0000-4000-8000-000000000001'
const creationKey = '53000000-0000-4000-8000-000000000001'

describe('ExistingCustomerClaimForm', () => {
  it('issues a claim for the selected original customer record', async () => {
    const user = userEvent.setup()
    const search = vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          customer_id: customerId,
          creation_key: creationKey,
          full_name: 'Existing Customer',
          phone_e164: '+256700000063',
          email: null,
        },
      ],
    })
    const issue = vi.fn().mockResolvedValue({
      success: true,
      data: {
        claimId: '51000000-0000-4000-8000-000000000001',
        customerId,
      },
    })
    render(
      <ExistingCustomerClaimForm
        garageId={garageId}
        search={search}
        issue={issue}
      />,
    )

    await user.type(
      screen.getByLabelText('Find customer by name or phone'),
      'Existing',
    )
    await user.click(screen.getByRole('button', { name: 'Find customer' }))
    await user.selectOptions(
      await screen.findByLabelText('Existing customer'),
      customerId,
    )
    await user.type(
      screen.getByLabelText('Claim email'),
      'corrected@example.test',
    )
    await user.click(
      screen.getByRole('button', { name: 'Send customer claim' }),
    )

    expect(search).toHaveBeenCalledWith(garageId, 'Existing')
    expect(issue).toHaveBeenCalledWith({
      garageId,
      fullName: 'Existing Customer',
      phone: '+256700000063',
      email: 'corrected@example.test',
      creationKey,
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Claim sent for the selected customer record.',
    )

    await user.click(screen.getByRole('button', { name: 'Find customer' }))
    await user.selectOptions(
      await screen.findByLabelText('Existing customer'),
      customerId,
    )
    expect(
      screen.getByRole('button', { name: 'Send customer claim' }),
    ).toBeEnabled()
  })
})
