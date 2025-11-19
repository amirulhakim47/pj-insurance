// Accessibility utilities for the insurance application

export const announceToScreenReader = (message: string) => {
  if (typeof window === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const announceUrgent = (message: string) => {
  if (typeof window === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getAriaDescribedBy = (ids: (string | undefined)[]): string | undefined => {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
};

// Focus management utilities
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

export const restoreFocus = (previousActiveElement: Element | null) => {
  if (previousActiveElement && 'focus' in previousActiveElement) {
    (previousActiveElement as HTMLElement).focus();
  }
};

// Keyboard navigation helpers
export const handleArrowNavigation = (
  e: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void
) => {
  let newIndex = currentIndex;
  
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = (currentIndex + 1) % items.length;
      e.preventDefault();
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      e.preventDefault();
      break;
    case 'Home':
      newIndex = 0;
      e.preventDefault();
      break;
    case 'End':
      newIndex = items.length - 1;
      e.preventDefault();
      break;
    default:
      return;
  }
  
  onIndexChange(newIndex);
  items[newIndex]?.focus();
};

// Screen reader text utilities
export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} Malaysian Ringgit`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage} percent`;
};

// Validation message helpers
export const getValidationMessage = (fieldName: string, error: string): string => {
  return `${fieldName}: ${error}`;
};

export const getFieldDescription = (fieldName: string, isRequired: boolean): string => {
  const required = isRequired ? 'Required field.' : 'Optional field.';
  return `${fieldName}. ${required}`;
};

// Progress announcement
export const announceProgress = (current: number, total: number, stepName?: string): void => {
  const message = stepName 
    ? `Step ${current} of ${total}: ${stepName}`
    : `Step ${current} of ${total}`;
  
  announceToScreenReader(message);
};

// Form submission announcements
export const announceFormSubmission = (): void => {
  announceToScreenReader('Form submitted successfully. Searching for insurance quotes.');
};

export const announceFormError = (errorCount: number): void => {
  const message = errorCount === 1 
    ? 'There is 1 error in the form. Please review and correct it.'
    : `There are ${errorCount} errors in the form. Please review and correct them.`;
  
  announceUrgent(message);
};

export const announcePolicySelection = (providerName: string, price: number): void => {
  const message = `Selected ${providerName} policy for ${formatCurrency(price)}`;
  announceToScreenReader(message);
};

// Loading state announcements
export const announceLoadingStart = (): void => {
  announceToScreenReader('Searching for insurance policies. Please wait.');
};

export const announceLoadingComplete = (policyCount: number): void => {
  const message = policyCount === 1
    ? 'Search complete. Found 1 insurance policy.'
    : `Search complete. Found ${policyCount} insurance policies.`;
  
  announceToScreenReader(message);
};

// Color contrast utilities (for development/testing)
export const checkColorContrast = (foreground: string, background: string): number => {
  // This is a simplified version - in production, you'd use a proper color contrast library
  // Returns a ratio that should be >= 4.5 for normal text, >= 3 for large text
  
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    // In production, use a proper color library
    return 0.5; // Placeholder
  };
  
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
};
