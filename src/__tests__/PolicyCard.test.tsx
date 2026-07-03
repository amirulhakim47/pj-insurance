import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolicyCard } from '@/components/ui/policy-card'
import { InsurancePolicy } from '@/types'

const mockPolicy: InsurancePolicy = {
  id: 'test-policy-1',
  provider: {
    name: 'Test Insurance',
    logo: '/logos/test-logo.svg',
    rating: 4.5,
  },
  startDate: '2024-01-01',
  expiryDate: '2024-12-31',
  description: 'Comprehensive car insurance with excellent coverage',
  originalPrice: 1200,
  discountPercentage: 10,
  finalPrice: 1080,
  features: [
    'Comprehensive coverage',
    '24/7 roadside assistance',
    'Windscreen protection',
  ],
  coverage: {
    liability: '1,000,000',
    comprehensive: true,
    theft: true,
    flood: false,
    windscreen: true,
  },
}

describe('PolicyCard', () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders policy information correctly', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText('Test Insurance')).toBeInTheDocument()
    expect(screen.getByText('Comprehensive car insurance with excellent coverage')).toBeInTheDocument()
    expect(screen.getAllByText(/Comprehensive/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('24/7 roadside assistance')).toBeInTheDocument()
    expect(screen.getByText('Windscreen protection')).toBeInTheDocument()
  })

  it('displays final price formatted as MYR currency', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText(/1,080\.00/)).toBeInTheDocument()
  })

  it('displays original price when discount exists', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText(/1,200\.00/)).toBeInTheDocument()
  })

  it('shows coverage period', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText(/01 Jan 2024/)).toBeInTheDocument()
    expect(screen.getByText(/31 Dec 2024/)).toBeInTheDocument()
  })

  it('calls onSelect when select button is clicked', async () => {
    const user = userEvent.setup()
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)

    const selectBtn = screen.getByRole('button', { name: /Select This Policy/i })
    await user.click(selectBtn)

    expect(mockOnSelect).toHaveBeenCalledWith(mockPolicy)
  })

  it('shows selected state with "Policy Selected" text', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={true} onSelect={mockOnSelect} />)

    expect(screen.getByText('Policy Selected')).toBeInTheDocument()
  })

  it('displays discount badge when discount is available', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText('-10% OFF')).toBeInTheDocument()
  })

  it('does not display discount badge when no discount', () => {
    const policyWithoutDiscount = { ...mockPolicy, discountPercentage: undefined }
    render(<PolicyCard policy={policyWithoutDiscount} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument()
  })

  it('shows loading state when policy is loading', () => {
    const loadingPolicy = { ...mockPolicy, loading: true }
    render(<PolicyCard policy={loadingPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText('Waiting for insurer')).toBeInTheDocument()
    expect(screen.queryByText('Test Insurance')).not.toBeInTheDocument()
  })

  it('shows coverage icons', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText('Comprehensive')).toBeInTheDocument()
    expect(screen.getByText('Theft')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalPolicy: InsurancePolicy = {
      ...mockPolicy,
      features: [],
      discountPercentage: undefined,
    }

    render(<PolicyCard policy={minimalPolicy} isSelected={false} onSelect={mockOnSelect} />)

    expect(screen.getByText('Test Insurance')).toBeInTheDocument()
    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument()
  })
})
