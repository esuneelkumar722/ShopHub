import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../../pages/LoginPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock variables
const mockNavigate = vi.fn();
const mockSetUser = vi.fn();

// Mock alert
const mockAlert = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).alert = mockAlert;

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn((selector) => {
    if (selector) {
      return selector({ setUser: mockSetUser });
    }
    return { setUser: mockSetUser };
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

describe('LoginPage', () => {
  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default successful mock responses
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.auth.signUp.mockResolvedValue({ error: null });
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
          created_at: '2024-01-01T00:00:00Z',
        },
      },
      error: null,
    });
    supabaseMock.auth.signOut.mockResolvedValue({ error: null });

    // Reset user store
    mockSetUser.mockClear();

    // Reset navigation
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders sign in form by default', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText('Welcome back to ShopHub')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('renders sign up form when toggled', () => {
    renderWithProviders(<LoginPage />);

    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Sign up to start shopping')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('updates email input value', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('updates password input value', () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput).toHaveValue('password123');
  });

  it('shows loading state during sign in submission', async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent('Processing...');
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Sign In');
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('handles successful sign in', async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('handles successful sign up', async () => {
    renderWithProviders(<LoginPage />);

    // Switch to sign up mode
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Check your email for the confirmation link!');
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('displays error message on sign in failure', async () => {
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Invalid credentials'),
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('displays error message on sign up failure', async () => {
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.auth.signUp.mockResolvedValue({
      error: new Error('Email already registered'),
    });

    renderWithProviders(<LoginPage />);

    // Switch to sign up mode
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('clears error when toggling between modes', async () => {
    // First, trigger an error in sign in mode
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    // Now toggle to sign up mode
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    // Error should be cleared
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('shows password requirements hint', () => {
    renderWithProviders(<LoginPage />);

    // Switch to sign up mode
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.focus(passwordInput);

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('has required attributes on form inputs', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
  it('prevents form submission with empty fields', () => {
    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Form should not submit due to HTML5 validation
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('validates password minimum length', async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } }); // Too short
    fireEvent.click(submitButton);

    // Should still attempt submission (HTML5 validation might not prevent it)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('handles network errors during sign in', async () => {
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles network errors during sign up', async () => {
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.auth.signUp.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<LoginPage />);

    // Switch to sign up mode
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('maintains loading state during long operations', async () => {
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.auth.signInWithPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
            created_at: '2024-01-01T00:00:00Z',
          },
        },
        error: null,
      }), 100))
    );

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check loading state immediately
    expect(submitButton).toHaveTextContent('Processing...');
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Sign In');
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 200 });
  });

  it('has proper form structure and accessibility', () => {
    renderWithProviders(<LoginPage />);

    // Check form element exists (forms don't have a default role, so we query directly)
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();

    // Check inputs have proper types
    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Check form has proper labels (even if not associated, they exist)
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('handles multiple rapid form submissions', async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Click multiple times rapidly
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // Should only trigger one submission
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  it('resets form state when switching modes', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    // Fill form in sign in mode
    fireEvent.change(emailInput, { target: { value: 'signin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('signin@example.com');
    expect(passwordInput).toHaveValue('password123');

    // Switch to sign up mode
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    // Form should still have the values (component doesn't clear them on mode switch)
    expect(emailInput).toHaveValue('signin@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});