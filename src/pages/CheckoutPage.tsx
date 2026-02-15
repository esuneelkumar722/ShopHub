import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { supabase } from '../lib/supabase';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';
import { DiscountCodeInput } from '../components/cart/DiscountCodeInput';
import { StripePaymentForm } from '../components/payment/StripePaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';
import type { DiscountCode } from '../types';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Validation schema - shipping info only (payment handled by Stripe)
const checkoutSchema = z.object({
  // Shipping Info
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const [step, setStep] = useState(1); // 1=Shipping, 2=Review, 3=Payment
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { items, getTotalPrice, clearCart } = useCartStore();
  const user = useUserStore((state) => state.user);

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger, // Validates specific fields
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur', // Validate when user leaves field
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Your Cart is Empty</h1>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  // Move to next step after validating current step fields
  const handleNextStep = async () => {
    if (step === 1) {
      const fieldsToValidate: (keyof CheckoutForm)[] = ['fullName', 'email', 'phone', 'address', 'city', 'zipCode'];
      const isValid = await trigger(fieldsToValidate);
      if (isValid) setStep(step + 1);
    } else if (step === 2) {
      // Step 2 is now review, just move to payment
      setStep(step + 1);
    }
  };

  // Calculate totals with discount
  const subtotal = getTotalPrice();
  const shipping = 10;
  const taxRate = 0.08;
  const tax = (subtotal - discountAmount) * taxRate;
  const total = subtotal + shipping + tax - discountAmount;

  // Final submission - save order to database
  const onSubmit = async () => {

    try {
      // Create order in Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order, error: orderError } = await (supabase as any)
        .from('orders')
        .insert({
          user_id: user?.id,
          total: total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items - use product.id to ensure correct reference
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id, // Use item.product.id instead of item.product_id
        quantity: item.quantity,
        price: item.product.price,
      }));

      console.log('Order items to insert:', orderItems); // Debug log

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Failed to insert order items:', itemsError);
        throw itemsError;
      }

      // Save discount if applied
      if (appliedDiscount) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: discountError } = await (supabase as any)
          .from('order_discounts')
          .insert({
            order_id: order.id,
            discount_code_id: appliedDiscount.id,
            discount_amount: discountAmount,
          });

        if (discountError) console.error('Failed to save discount:', discountError);
      }

      // Success! Clear cart and redirect
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12">
        {[
          { num: 1, label: 'Shipping', icon: Truck },
          { num: 2, label: 'Review', icon: CheckCircle },
          { num: 3, label: 'Payment', icon: CreditCard },
        ].map(({ num, label, icon: Icon }) => (
          <div key={num} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= num
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="ml-2 font-medium dark:text-white">{label}</span>
            {num < 3 && (
              <div
                className={`w-20 h-1 mx-4 ${step > num ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Shipping Information */}
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
          <div className="card space-y-4">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Shipping Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Full Name *</label>
              <input {...register('fullName')} className="input dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="John Doe" />
              {errors.fullName && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Email *</label>
                <input {...register('email')} type="email" className="input dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="john@example.com" />
                {errors.email && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Phone *</label>
                <input {...register('phone')} className="input dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="1234567890" />
                {errors.phone && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Address *</label>
              <input {...register('address')} className="input dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="123 Main St" />
              {errors.address && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">City *</label>
                <input {...register('city')} className="input dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="New York" />
                {errors.city && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">ZIP Code *</label>
                <input {...register('zipCode')} className="input dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="10001" />
                {errors.zipCode && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.zipCode.message}</p>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Continue to Review
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Order Review */}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between dark:text-gray-200">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t dark:border-gray-600 pt-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({appliedDiscount?.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold mt-2 dark:text-white">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <DiscountCodeInput
                subtotal={subtotal}
                onDiscountApplied={(discount, amount) => {
                  setAppliedDiscount(discount);
                  setDiscountAmount(amount);
                }}
                onDiscountRemoved={() => {
                  setAppliedDiscount(null);
                  setDiscountAmount(0);
                }}
              />
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                Back
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                Continue to Payment
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 3: Payment Information */}
      {step === 3 && (
        <Elements stripe={getStripe()}>
          <StripePaymentForm
            amount={total}
            onSuccess={handleSubmit(onSubmit)}
            onCancel={() => setStep(2)}
          />
        </Elements>
      )}


    </div>
  );
};
