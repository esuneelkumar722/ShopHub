import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { supabase } from '../lib/supabase';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';

// Validation schema - defines what's required and format rules
const checkoutSchema = z.object({
  // Shipping Info
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),

  // Payment Info
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cardName: z.string().min(2, 'Name on card is required'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV must be 3 digits'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const [step, setStep] = useState(1); // 1=Shipping, 2=Payment, 3=Review
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  // Move to next step after validating current step fields
  const handleNextStep = async () => {
    let fieldsToValidate: (keyof CheckoutForm)[] = [];

    if (step === 1) {
      fieldsToValidate = ['fullName', 'email', 'phone', 'address', 'city', 'zipCode'];
    } else if (step === 2) {
      fieldsToValidate = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  // Final submission - save order to database
  const onSubmit = async (_formData: CheckoutForm) => {
    setIsSubmitting(true);

    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total: getTotalPrice() + 10, // +$10 shipping
          status: 'pending',
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: (order as any).id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any);

      if (itemsError) throw itemsError;

      // Success! Clear cart and redirect
      clearCart();
      navigate('/orders');
      alert('Order placed successfully!');
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to place order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = getTotalPrice();
  const shipping = 10;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12">
        {[
          { num: 1, label: 'Shipping', icon: Truck },
          { num: 2, label: 'Payment', icon: CreditCard },
          { num: 3, label: 'Review', icon: CheckCircle },
        ].map(({ num, label, icon: Icon }) => (
          <div key={num} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= num
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500'
                }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="ml-2 font-medium">{label}</span>
            {num < 3 && (
              <div
                className={`w-20 h-1 mx-4 ${step > num ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Shipping Information */}
        {step === 1 && (
          <div className="card space-y-4">
            <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input {...register('fullName')} className="input" placeholder="John Doe" />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input {...register('email')} type="email" className="input" placeholder="john@example.com" />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input {...register('phone')} className="input" placeholder="1234567890" />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <input {...register('address')} className="input" placeholder="123 Main St" />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input {...register('city')} className="input" placeholder="New York" />
                {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                <input {...register('zipCode')} className="input" placeholder="10001" />
                {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>}
              </div>
            </div>

            <button type="button" onClick={handleNextStep} className="btn btn-primary w-full">
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment Information */}
        {step === 2 && (
          <div className="card space-y-4">
            <h2 className="text-2xl font-bold mb-4">Payment Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Card Number *</label>
              <input {...register('cardNumber')} className="input" placeholder="1234567890123456" maxLength={16} />
              {errors.cardNumber && <p className="text-red-600 text-sm mt-1">{errors.cardNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Name on Card *</label>
              <input {...register('cardName')} className="input" placeholder="John Doe" />
              {errors.cardName && <p className="text-red-600 text-sm mt-1">{errors.cardName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                <input {...register('expiryDate')} className="input" placeholder="MM/YY" maxLength={5} />
                {errors.expiryDate && <p className="text-red-600 text-sm mt-1">{errors.expiryDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CVV *</label>
                <input {...register('cvv')} className="input" placeholder="123" maxLength={3} />
                {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv.message}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                Back
              </button>
              <button type="button" onClick={handleNextStep} className="btn btn-primary flex-1">
                Review Order
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Order Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold mt-2">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary flex-1">
                Back
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
