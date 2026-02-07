import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { DiscountCode } from '../../types';
import { toast } from 'sonner';

interface DiscountCodeInputProps {
  subtotal: number;
  onDiscountApplied: (discount: DiscountCode, amount: number) => void;
  onDiscountRemoved: () => void;
}

export const DiscountCodeInput = ({
  subtotal,
  onDiscountApplied,
  onDiscountRemoved,
}: DiscountCodeInputProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: DiscountCode; amount: number } | null>(null);

  const validateAndApplyDiscount = async () => {
    if (!code.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    setLoading(true);

    try {
      const result = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true);

      const { data, error } = result as { data: DiscountCode[] | null; error: Error | null };

      if (error || !data || data.length === 0) {
        toast.error('Invalid or expired discount code');
        setLoading(false);
        return;
      }

      // Handle array response
      const discountData = data[0];

      // Check if code is still valid
      const now = new Date();
      const validFrom = new Date(discountData.valid_from);
      const validUntil = discountData.valid_until ? new Date(discountData.valid_until) : null;

      if (now < validFrom) {
        toast.error('This discount code is not yet valid');
        setLoading(false);
        return;
      }

      if (validUntil && now > validUntil) {
        toast.error('This discount code has expired');
        setLoading(false);
        return;
      }

      // Check usage limit
      if (discountData.usage_limit && discountData.used_count >= discountData.usage_limit) {
        toast.error('This discount code has reached its usage limit');
        setLoading(false);
        return;
      }

      // Check minimum purchase amount
      if (subtotal < discountData.min_purchase_amount) {
        toast.error(`Minimum purchase of $${discountData.min_purchase_amount.toFixed(2)} required`);
        setLoading(false);
        return;
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (discountData.discount_type === 'percentage') {
        discountAmount = (subtotal * discountData.discount_value) / 100;
        if (discountData.max_discount_amount) {
          discountAmount = Math.min(discountAmount, discountData.max_discount_amount);
        }
      } else {
        discountAmount = discountData.discount_value;
      }

      discountAmount = Math.min(discountAmount, subtotal);

      setAppliedDiscount({ code: discountData, amount: discountAmount });
      onDiscountApplied(discountData, discountAmount);
      toast.success(`Discount code "${discountData.code}" applied! You saved $${discountAmount.toFixed(2)}`);
      setCode('');
    } catch {
      toast.error('Failed to apply discount code');
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    onDiscountRemoved();
    toast.info('Discount code removed');
  };

  return (
    <div className="space-y-3">
      {appliedDiscount ? (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                {appliedDiscount.code.code}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Saved ${appliedDiscount.amount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={removeDiscount}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors focus-visible"
            aria-label="Remove discount code"
          >
            <X className="w-5 h-5 text-green-600 dark:text-green-400" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && validateAndApplyDiscount()}
              placeholder="Enter discount code"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              aria-label="Discount code"
            />
          </div>
          <button
            onClick={validateAndApplyDiscount}
            disabled={loading || !code.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      )}
    </div>
  );
};
