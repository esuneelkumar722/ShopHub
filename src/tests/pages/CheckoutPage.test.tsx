import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock dependencies
vi.mock('../../store/cartStore', () => ({
  useCartStore: vi.fn(() => ({
    items: [
      {
        id: '1',
        product_id: 'prod1',
        quantity: 1,
        product: {
          id: 'prod1',
          name: 'Test Product',
          price: 99.99,
          image_url: 'test.jpg'
        }
      }
    ],
    getTotalPrice: vi.fn(() => 99.99),
    clearCart: vi.fn()
  }))
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: 'user1', email: 'test@example.com' }
  }))
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn())
  };
});

vi.mock('sonner', () => ({
  toast: vi.fn()
}));

// Mock Stripe components (excluded from testing as per user request)
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardElement: () => <div>Card Element</div>,
  useStripe: () => null,
  useElements: () => null
}));

vi.mock('../lib/stripe', () => ({
  getStripe: vi.fn()
}));

vi.mock('../components/payment/StripePaymentForm', () => ({
  StripePaymentForm: () => <div data-testid="stripe-payment-form">Stripe Payment Form</div>
}));

vi.mock('../components/cart/DiscountCodeInput', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DiscountCodeInput: ({ onDiscountApplied }: { onDiscountApplied: (discount: any) => void }) => (
    <button onClick={() => onDiscountApplied({ code: 'TEST10', percentage: 10 })}>
      Apply Discount
    </button>
  )
}));

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders checkout page with shipping form initially', () => {
    renderWithProviders(<CheckoutPage />);

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1234567890')).toBeInTheDocument();
  });


  it('validates required fields', async () => {
    renderWithProviders(<CheckoutPage />);

    const continueButton = screen.getByRole('button', { name: /continue to payment/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid email', async () => {
    renderWithProviders(<CheckoutPage />);

    const emailInput = screen.getByPlaceholderText('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid phone', async () => {
    renderWithProviders(<CheckoutPage />);

    const phoneInput = screen.getByPlaceholderText('1234567890');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);

    await waitFor(() => {
      expect(screen.getByText('Phone must be 10 digits')).toBeInTheDocument();
    });
  });
});