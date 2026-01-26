import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripePaymentForm = ({ amount, onSuccess, onCancel }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please wait.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setProcessing(true);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      // In a real app, you would:
      // 1. Send paymentMethod.id to your backend
      // 2. Backend creates PaymentIntent with Stripe
      // 3. Backend returns client_secret
      // 4. Frontend confirms payment with client_secret

      // For now, simulate successful payment
      console.log('Payment Method Created:', paymentMethod);
      toast.success(`Payment of $${amount.toFixed(2)} processed successfully! (Test Mode)`);

      // Clear the card element
      cardElement.clear();

      // Call success callback to move to review step
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'An error occurred during payment');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="card bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold dark:text-white">Payment Details</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element Container */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Information *
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
            <CardElement
              options={cardElementOptions}
              onChange={(e: StripeCardElementChangeEvent) => setCardComplete(e.complete)}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Test card: 4242 4242 4242 4242 | Any future date | Any 3-digit CVV
          </p>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Lock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-white">
              Secure Payment
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium dark:text-white">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus-visible transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!stripe || processing || !cardComplete}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible transition-colors font-medium"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
        </div>
      </form>

      {/* Test Mode Badge */}
      <div className="mt-4 text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          🧪 Test Mode - No real charges will be made
        </span>
      </div>
    </div>
  );
};
