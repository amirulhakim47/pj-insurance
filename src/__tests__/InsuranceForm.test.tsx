import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InsuranceForm from '@/components/InsuranceForm'

// Mock the router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('InsuranceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear sessionStorage
    window.sessionStorage.clear()
  })

  it('renders the form with all required fields', () => {
    render(<InsuranceForm />)
    
    expect(screen.getByText('Get Your Insurance Quote')).toBeInTheDocument()
    expect(screen.getByLabelText(/vehicle type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nric number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vehicle plate number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/customer type/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get insurance quotes/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)
    
    const submitButton = screen.getByRole('button', { name: /get insurance quotes/i })
    
    // Try to submit without filling any fields
    await user.click(submitButton)
    
    // Check that validation errors appear
    await waitFor(() => {
      expect(screen.getByText(/please select a vehicle type/i)).toBeInTheDocument()
    })
  })

  it('validates NRIC format', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)
    
    const nricInput = screen.getByLabelText(/nric number/i)
    
    // Enter invalid NRIC
    await user.type(nricInput, 'invalid')
    await user.tab() // Trigger validation
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid nric format/i)).toBeInTheDocument()
    })
  })

  it('validates postcode format', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)
    
    const postcodeInput = screen.getByLabelText(/postcode/i)
    
    // Enter invalid postcode
    await user.type(postcodeInput, '123')
    await user.tab() // Trigger validation
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid 5-digit postcode/i)).toBeInTheDocument()
    })
  })

  it('formats NRIC input correctly', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)
    
    const nricInput = screen.getByLabelText(/nric number/i) as HTMLInputElement
    
    // Enter NRIC digits
    await user.type(nricInput, '123456121234')
    
    // Check that it's formatted correctly
    expect(nricInput.value).toBe('123456-12-1234')
  })

  it('formats plate number to uppercase', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)
    
    const plateInput = screen.getByLabelText(/vehicle plate number/i) as HTMLInputElement
    
    // Enter lowercase plate number
    await user.type(plateInput, 'abc1234')
    
    // Check that it's converted to uppercase
    expect(plateInput.value).toBe('ABC1234')
  })

  it('submits form with valid data and navigates to loading page', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)
    
    // Fill out the form with valid data
    await user.click(screen.getByLabelText(/car/i))
    await user.type(screen.getByLabelText(/nric number/i), '123456121234')
    await user.type(screen.getByLabelText(/vehicle plate number/i), 'ABC1234')
    await user.type(screen.getByLabelText(/postcode/i), '50450')
    await user.click(screen.getByLabelText(/individual/i))
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /get insurance quotes/i }))
    
    // Check that data is stored in sessionStorage
    await waitFor(() => {
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'insuranceFormData',
        expect.stringContaining('123456-12-1234')
      )
    })
    
    // Check that navigation occurs
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/loading')
    })
  })

  it('disables submit button when form is invalid', () => {
    render(<InsuranceForm />)
    
    const submitButton = screen.getByRole('button', { name: /get insurance quotes/i })
    
    // Button should be disabled initially
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)
    
    // Fill out the form with valid data
    await user.click(screen.getByLabelText(/car/i))
    await user.type(screen.getByLabelText(/nric number/i), '123456121234')
    await user.type(screen.getByLabelText(/vehicle plate number/i), 'ABC1234')
    await user.type(screen.getByLabelText(/postcode/i), '50450')
    await user.click(screen.getByLabelText(/individual/i))
    
    const submitButton = screen.getByRole('button', { name: /get insurance quotes/i })
    
    // Button should be enabled now
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})
