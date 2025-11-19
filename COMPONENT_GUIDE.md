# Component Guide

This guide provides an overview of all components in the Car Insurance Renewal Application.

## 🧩 Component Architecture

The application follows a modular component architecture with reusable UI components and feature-specific components.

## 📁 Component Structure

```
src/components/
├── ui/                    # Reusable UI components
│   ├── button.tsx        # Button component with variants
│   ├── card.tsx          # Card container component
│   ├── form-field.tsx    # Form input components
│   ├── layout.tsx        # Layout and container components
│   ├── loading.tsx       # Loading and progress components
│   ├── policy-card.tsx   # Insurance policy display card
│   └── progress.tsx      # Progress bar component
└── InsuranceForm.tsx     # Main insurance form component
```

## 🎨 UI Components

### Button Component
**File**: `src/components/ui/button.tsx`

A versatile button component with multiple variants and states.

**Variants**:
- `default` - Primary orange button
- `destructive` - Red button for dangerous actions
- `outline` - Outlined button
- `secondary` - Secondary gray button
- `ghost` - Transparent button
- `link` - Link-styled button

**Sizes**:
- `default` - Standard size
- `sm` - Small button
- `lg` - Large button
- `icon` - Icon-only button

**Usage**:
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="lg">
  Get Insurance Quotes
</Button>
```

### Card Component
**File**: `src/components/ui/card.tsx`

Container component for grouping related content.

**Sub-components**:
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Policy Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Policy information goes here</p>
  </CardContent>
</Card>
```

### Form Field Components
**File**: `src/components/ui/form-field.tsx`

Specialized form input components with validation and formatting.

**Components**:
- `FormField` - Generic form field wrapper
- `TextField` - Text input with validation
- `RadioField` - Radio button group
- `NRICField` - NRIC input with formatting
- `PlateNumberField` - Plate number input with validation

**Features**:
- Automatic formatting (NRIC, plate numbers)
- Real-time validation
- Error message display
- Accessibility support

**Usage**:
```tsx
import { NRICField, PlateNumberField } from '@/components/ui/form-field'

<NRICField
  label="NRIC Number"
  value={nric}
  onChange={setNric}
  error={errors.nric}
/>
```

### Layout Components
**File**: `src/components/ui/layout.tsx`

Layout and container components for consistent spacing and structure.

**Components**:
- `PageLayout` - Main page wrapper
- `Container` - Content container with max-width
- `StepIndicator` - Progress indicator for multi-step flows
- `Grid` - Responsive grid layout

**Usage**:
```tsx
import { PageLayout, Container, Grid } from '@/components/ui/layout'

<PageLayout>
  <Container>
    <Grid cols={{ default: 1, md: 2, lg: 3 }}>
      {/* Grid items */}
    </Grid>
  </Container>
</PageLayout>
```

### Loading Components
**File**: `src/components/ui/loading.tsx`

Loading states and progress indicators.

**Components**:
- `LoadingSpinner` - Animated spinner
- `AnimatedProgress` - Progress bar with animation
- `InsuranceLoading` - Insurance-specific loading component
- `SkeletonCard` - Skeleton loading placeholder

**Usage**:
```tsx
import { AnimatedProgress, LoadingSpinner } from '@/components/ui/loading'

<AnimatedProgress 
  progress={progress} 
  duration={5000}
  onComplete={() => navigate('/results')}
/>
```

### Policy Card Component
**File**: `src/components/ui/policy-card.tsx`

Comprehensive component for displaying insurance policy information.

**Features**:
- Provider logo and information
- Policy details and coverage
- Pricing with discounts
- Selection states
- Accessibility support

**Props**:
- `policy` - Insurance policy data
- `isSelected` - Selection state
- `onSelect` - Selection callback

**Usage**:
```tsx
import { PolicyCard } from '@/components/ui/policy-card'

<PolicyCard
  policy={policyData}
  isSelected={selectedPolicy?.id === policy.id}
  onSelect={handlePolicySelect}
/>
```

### Progress Component
**File**: `src/components/ui/progress.tsx`

Progress bar component with smooth animations.

**Features**:
- Smooth progress animation
- Customizable duration
- Completion callbacks
- Accessibility support

**Usage**:
```tsx
import { Progress } from '@/components/ui/progress'

<Progress value={progress} className="w-full" />
```

## 🏗️ Feature Components

### Insurance Form Component
**File**: `src/components/InsuranceForm.tsx`

Main form component that orchestrates the entire insurance input flow.

**Features**:
- Multi-step form validation
- Real-time input formatting
- Error handling and display
- Form state management
- Navigation to loading page

**Form Fields**:
1. Vehicle type selection (Car/Motorcycle)
2. NRIC number input with formatting
3. Vehicle plate number validation
4. Postcode input (Malaysian format)
5. Customer type selection (Individual/Company)

**Validation**:
- NRIC format: `123456-12-1234`
- Plate number format: `ABC1234` or `A1234B`
- Postcode format: `12345` (5 digits)

**Usage**:
```tsx
import InsuranceForm from '@/components/InsuranceForm'

<InsuranceForm />
```

## 🎯 Component Best Practices

### 1. Accessibility
All components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

### 2. Performance
- Lazy loading for heavy components
- Memoization for expensive calculations
- Optimized re-renders

### 3. Type Safety
- Full TypeScript implementation
- Strict prop types
- Generic components where appropriate

### 4. Styling
- Tailwind CSS for consistent styling
- CSS custom properties for theming
- Responsive design patterns

### 5. Testing
- Unit tests for all components
- Accessibility testing
- Visual regression testing

## 🔧 Customization

### Theming
Modify colors in `src/app/globals.css`:
```css
:root {
  --primary: oklch(0.7 0.15 35);
  --primary-foreground: oklch(0.98 0.02 35);
  /* ... other colors */}
```

### Component Variants
Add new variants to existing components:
```tsx
const buttonVariants = cva(
  "base-styles",
  {
    variants: {
      variant: {
        default: "default-styles",
        custom: "your-custom-styles", // Add new variant
      },
    },
  }
)
```

### New Components
Follow the established patterns:
1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Include accessibility features
4. Add tests
5. Document usage

## 📚 Component Dependencies

### External Dependencies
- `@radix-ui/react-label` - Accessible form labels
- `lucide-react` - Icon components
- `class-variance-authority` - Component variants
- `clsx` - Conditional classes

### Internal Dependencies
- `@/lib/utils` - Utility functions
- `@/types` - TypeScript types
- `@/lib/validations` - Validation schemas

## 🧪 Testing Components

### Unit Testing
```bash
npm test -- --testPathPattern=components
```

### Component Testing
```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})
```

### Accessibility Testing
```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('should not have accessibility violations', async () => {
  const { container } = render(<YourComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## 🎨 Design Tokens

### Spacing
- Base unit: `4px`
- Scale: `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64`

### Typography
- Font family: Geist Sans, Geist Mono
- Scale: `xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl`

### Colors
- Primary: Orange scale (50-950)
- Neutral: Gray scale (50-950)
- Semantic: Success, warning, error, info

### Border Radius
- `none, sm, md, lg, xl, 2xl, 3xl, full`

### Shadows
- `xs, sm, md, lg, xl, 2xl, inner, none`

This component guide provides a comprehensive overview of the application's component architecture and usage patterns.
