import { render, screen, fireEvent } from '@testing-library/react'
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
  vehicleType: 'car',
  coverage: {
    liability: 1000000,
    comprehensive: true,
    thirdParty: true,
    personalAccident: 50000,
  },
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  description: 'Comprehensive car insurance with excellent coverage',
  originalPrice: 1200,
  discount: 10,
  finalPrice: 1080,
  features: [
    'Comprehensive coverage',
    '24/7 roadside assistance',
    'Windscreen protection',
  ],
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
    expect(screen.getByText('RM1,080.00')).toBeInTheDocument()
    expect(screen.getByText('RM1,200.00')).toBeInTheDocument()
    expect(screen.getByText('10% OFF')).toBeInTheDocument()
    expect(screen.getByText('Comprehensive coverage')).toBeInTheDocument()
    expect(screen.getByText('24/7 roadside assistance')).toBeInTheDocument()
    expect(screen.getByText('Windscreen protection')).toBeInTheDocument()
  })

  it('displays provider rating', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('shows coverage period', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    expect(screen.getByText(/1 Jan 2024 - 31 Dec 2024/)).toBeInTheDocument()
  })

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup()
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockPolicy)
  })

  it('shows selected state correctly', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={true} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveClass('ring-2', 'ring-primary')
  })

  it('shows unselected state correctly', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    expect(card).not.toHaveClass('ring-2', 'ring-primary')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    
    // Focus the card
    card.focus()
    expect(card).toHaveFocus()
    
    // Press Enter
    await user.keyboard('{Enter}')
    expect(mockOnSelect).toHaveBeenCalledWith(mockPolicy)
    
    // Press Space
    await user.keyboard(' ')
    expect(mockOnSelect).toHaveBeenCalledTimes(2)
  })

  it('displays discount badge when discount is available', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    const discountBadge = screen.getByText('10% OFF')
    expect(discountBadge).toBeInTheDocument()
    expect(discountBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('does not display discount badge when no discount', () => {
    const policyWithoutDiscount = { ...mockPolicy, discount: 0 }
    render(<PolicyCard policy={policyWithoutDiscount} isSelected={false} onSelect={mockOnSelect} />)
    
    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-pressed', 'false')
    
    // Test with selected state
    render(<PolicyCard policy={mockPolicy} isSelected={true} onSelect={mockOnSelect} />)
    
    const selectedCard = screen.getByRole('button')
    expect(selectedCard).toHaveAttribute('aria-pressed', 'true')
  })

  it('formats currency correctly', () => {
    render(<PolicyCard policy={mockPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    // Check that prices are formatted with RM prefix and 2 decimal places
    expect(screen.getByText('RM1,080.00')).toBeInTheDocument()
    expect(screen.getByText('RM1,200.00')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalPolicy = {
      ...mockPolicy,
      features: [],
      discount: 0,
    }
    
    render(<PolicyCard policy={minimalPolicy} isSelected={false} onSelect={mockOnSelect} />)
    
    // Should still render without errors
    expect(screen.getByText('Test Insurance')).toBeInTheDocument()
    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument()
  })
})
