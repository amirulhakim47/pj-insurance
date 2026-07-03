import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InsuranceForm from '@/components/InsuranceForm'

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

describe('InsuranceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(window.sessionStorage.setItem as jest.Mock).mockClear()
  })

  it('renders the form with all required fields', () => {
    render(<InsuranceForm />)

    expect(screen.getByText('Get Your Insurance Quote')).toBeInTheDocument()
    expect(screen.getByText('Vehicle Type')).toBeInTheDocument()
    expect(screen.getByText(/NRIC \/ ID Number/)).toBeInTheDocument()
    expect(screen.getByText('Vehicle Plate Number')).toBeInTheDocument()
    expect(screen.getByText('Postcode')).toBeInTheDocument()
    expect(screen.getByText('Customer Type')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get insurance quotes/i })).toBeInTheDocument()
  })

  it('renders identity type selector', () => {
    render(<InsuranceForm />)

    expect(screen.getByText('Identity Type')).toBeInTheDocument()
    expect(screen.getByDisplayValue(/NRIC/)).toBeInTheDocument()
  })

  it('renders vehicle type radio options', () => {
    render(<InsuranceForm />)

    expect(screen.getByText('Car')).toBeInTheDocument()
    expect(screen.getByText('Motorcycle')).toBeInTheDocument()
  })

  it('renders customer type radio options', () => {
    render(<InsuranceForm />)

    expect(screen.getByText('Individual')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
  })

  it('formats NRIC input with dashes', async () => {
    const user = userEvent.setup()
    render(<InsuranceForm />)

    const nricInput = screen.getByPlaceholderText('123456-12-1234')
    await user.type(nricInput, '841103011116')

    expect((nricInput as HTMLInputElement).value).toBe('841103-01-1116')
  })

  it('formats plate number to uppercase', () => {
    render(<InsuranceForm />)

    const plateInput = screen.getByPlaceholderText('ABC1234') as HTMLInputElement
    fireEvent.change(plateInput, { target: { value: 'abc1234' } })

    expect(plateInput.value).toBe('ABC1234')
  })

  it('disables submit button when form is invalid', () => {
    render(<InsuranceForm />)

    const submitButton = screen.getByRole('button', { name: /get insurance quotes/i })
    expect(submitButton).toBeDisabled()
  })

  it('shows email and phone fields', () => {
    render(<InsuranceForm />)

    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0123456789')).toBeInTheDocument()
  })

  it('shows PDPA consent section', () => {
    render(<InsuranceForm />)

    expect(screen.getByText(/Personal Data Protection Act/i)).toBeInTheDocument()
  })

  it('shows data protection card', () => {
    render(<InsuranceForm />)

    expect(screen.getByText(/Your Data is Protected/i)).toBeInTheDocument()
  })

  it('shows e-hailing and electric vehicle checkboxes', () => {
    render(<InsuranceForm />)

    expect(screen.getByText(/e-hailing/i)).toBeInTheDocument()
    expect(screen.getByText(/electric vehicle/i)).toBeInTheDocument()
  })
})
