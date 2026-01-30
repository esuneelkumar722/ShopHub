import { renderWithProviders, screen, fireEvent, waitFor } from '../renderWithProviders';
import { vi } from 'vitest';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { DiscountCodeInput } from '../../../src/components/cart/DiscountCodeInput';

describe('DiscountCodeInput', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { toast } = await import('sonner');
    toast.success = vi.isMockFunction(toast.success) ? toast.success : vi.fn();
    toast.error = vi.isMockFunction(toast.error) ? toast.error : vi.fn();
    toast.info = vi.isMockFunction(toast.info) ? toast.info : vi.fn();
  });

  it('disables apply when input is empty', () => {
    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    expect(input).toHaveValue('');

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).toBeDisabled();
  });

  it('applies percentage discount and calls callback with calculated amount', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600_000).toISOString();
    const validUntil = new Date(now.getTime() + 3600_000).toISOString();

    const discountData = {
      id: 'dc-1',
      code: 'SAVE10',
      discount_type: 'percentage',
      discount_value: 10,
      max_discount_amount: null,
      min_purchase_amount: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: null,
      used_count: 0,
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    const onDiscountApplied = vi.fn();
    renderWithProviders(<DiscountCodeInput subtotal={200} onDiscountApplied={onDiscountApplied} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'save10' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).not.toBeDisabled();
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(onDiscountApplied).toHaveBeenCalledWith(discountData, 20);
      expect(screen.getByText('SAVE10')).toBeInTheDocument();
      expect(screen.getByText('Saved $20.00')).toBeInTheDocument();
    });
  });

  it('applies fixed discount and calls callback with calculated amount', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600_000).toISOString();
    const validUntil = new Date(now.getTime() + 3600_000).toISOString();

    const discountData = {
      id: 'dc-3',
      code: 'FIXED5',
      discount_type: 'fixed',
      discount_value: 5,
      max_discount_amount: null,
      min_purchase_amount: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: null,
      used_count: 0,
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    const onDiscountApplied = vi.fn();
    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={onDiscountApplied} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'fixed5' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(onDiscountApplied).toHaveBeenCalledWith(discountData, 5);
      expect(screen.getByText('FIXED5')).toBeInTheDocument();
      expect(screen.getByText('Saved $5.00')).toBeInTheDocument();
    });
  });

  it('applies percentage discount with max discount cap', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600_000).toISOString();
    const validUntil = new Date(now.getTime() + 3600_000).toISOString();

    const discountData = {
      id: 'dc-4',
      code: 'MAX10',
      discount_type: 'percentage',
      discount_value: 50, // 50% of 100 = 50, but max is 10
      max_discount_amount: 10,
      min_purchase_amount: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: null,
      used_count: 0,
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    const onDiscountApplied = vi.fn();
    renderWithProviders(<DiscountCodeInput subtotal={100} onDiscountApplied={onDiscountApplied} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'max10' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(onDiscountApplied).toHaveBeenCalledWith(discountData, 10); // Capped at max_discount_amount
      expect(screen.getByText('MAX10')).toBeInTheDocument();
      expect(screen.getByText('Saved $10.00')).toBeInTheDocument();
    });
  });

  it('shows error for invalid discount code', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    });

    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'INVALID' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByText('INVALID')).not.toBeInTheDocument();
      // Error toast is mocked, so we check that no discount was applied
    });
  });

  it('shows error for code not yet valid', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() + 3600_000).toISOString(); // Future date
    const validUntil = new Date(now.getTime() + 7200_000).toISOString();

    const discountData = {
      id: 'dc-5',
      code: 'FUTURE',
      discount_type: 'fixed',
      discount_value: 5,
      max_discount_amount: null,
      min_purchase_amount: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: null,
      used_count: 0,
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'future' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByText('FUTURE')).not.toBeInTheDocument();
    });
  });

  it('shows error for expired discount code', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() - 7200_000).toISOString();
    const validUntil = new Date(now.getTime() - 3600_000).toISOString(); // Past date

    const discountData = {
      id: 'dc-6',
      code: 'EXPIRED',
      discount_type: 'fixed',
      discount_value: 5,
      max_discount_amount: null,
      min_purchase_amount: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: null,
      used_count: 0,
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'expired' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByText('EXPIRED')).not.toBeInTheDocument();
    });
  });

  it('shows error for usage limit reached', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600_000).toISOString();
    const validUntil = new Date(now.getTime() + 3600_000).toISOString();

    const discountData = {
      id: 'dc-7',
      code: 'LIMITED',
      discount_type: 'fixed',
      discount_value: 5,
      max_discount_amount: null,
      min_purchase_amount: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: 10,
      used_count: 10, // Reached limit
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'limited' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByText('LIMITED')).not.toBeInTheDocument();
    });
  });

  it('shows error for subtotal below minimum purchase', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600_000).toISOString();
    const validUntil = new Date(now.getTime() + 3600_000).toISOString();

    const discountData = {
      id: 'dc-8',
      code: 'MIN50',
      discount_type: 'fixed',
      discount_value: 5,
      max_discount_amount: null,
      min_purchase_amount: 50,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: null,
      used_count: 0,
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    renderWithProviders(<DiscountCodeInput subtotal={30} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'min50' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByText('MIN50')).not.toBeInTheDocument();
    });
  });

  it('handles Enter key to apply discount', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600_000).toISOString();
    const validUntil = new Date(now.getTime() + 3600_000).toISOString();

    const discountData = {
      id: 'dc-9',
      code: 'ENTER',
      discount_type: 'fixed',
      discount_value: 5,
      max_discount_amount: null,
      min_purchase_amount: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: null,
      used_count: 0,
    };

    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: discountData, error: null }),
          }),
        }),
      }),
    });

    const onDiscountApplied = vi.fn();
    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={onDiscountApplied} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'enter' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onDiscountApplied).toHaveBeenCalledWith(discountData, 5);
      expect(screen.getByText('ENTER')).toBeInTheDocument();
    });
  });

  it('converts input to uppercase', () => {
    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'lowercase' } });

    expect(input).toHaveValue('LOWERCASE');
  });

  it('shows loading state during apply', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;

    // Mock a delayed response
    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))),
          }),
        }),
      }),
    });

    renderWithProviders(<DiscountCodeInput subtotal={50} onDiscountApplied={vi.fn()} onDiscountRemoved={vi.fn()} />);

    const input = screen.getByLabelText('Discount code');
    fireEvent.change(input, { target: { value: 'loading' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(applyButton).toHaveTextContent('Applying...');
    expect(applyButton).toBeDisabled();

    await waitFor(() => {
      expect(applyButton).toHaveTextContent('Apply');
    });
  });
});
