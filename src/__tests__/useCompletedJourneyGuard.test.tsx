import { renderHook, act } from '@testing-library/react';
import { useCompletedJourneyGuard } from '@/hooks/useCompletedJourneyGuard';
import { COMPLETED_JOURNEY_KEY } from '@/lib/insurance-session';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn(), prefetch: jest.fn(), forward: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/results',
}));

describe('useCompletedJourneyGuard', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
    jest.mocked(sessionStorage.getItem).mockImplementation((key) => store[key] ?? null);
  });

  it('does nothing when the journey has not been paid', () => {
    const { result } = renderHook(() => useCompletedJourneyGuard());
    expect(result.current).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to thank-you after payment', () => {
    store[COMPLETED_JOURNEY_KEY] = JSON.stringify({ contractNumber: 'CNAZ00005349366', completedAt: 1 });
    const { result } = renderHook(() => useCompletedJourneyGuard());
    expect(result.current).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/thank-you');
  });

  it('redirects when the page is restored from the back-forward cache', () => {
    renderHook(() => useCompletedJourneyGuard());
    expect(mockReplace).not.toHaveBeenCalled();

    store[COMPLETED_JOURNEY_KEY] = JSON.stringify({ contractNumber: 'CNAZ00005349366', completedAt: 1 });
    act(() => {
      const event = new Event('pageshow') as PageTransitionEvent;
      Object.defineProperty(event, 'persisted', { value: true });
      window.dispatchEvent(event);
    });
    expect(mockReplace).toHaveBeenCalledWith('/thank-you');
  });
});
