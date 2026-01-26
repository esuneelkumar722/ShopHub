import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AddToCartButton = ({
  onClick,
  disabled,
  className = '',
  children = 'Add to Cart'
}: AddToCartButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`relative ${className}`}
      whileTap={{ scale: 0.95 }}
    >
      {children}

      {isAnimating && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: 0.5,
            opacity: 0,
            x: typeof window !== 'undefined' ? window.innerWidth / 2 - 100 : 0,
            y: -100
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <ShoppingCart className="w-6 h-6 text-primary-600" />
        </motion.div>
      )}
    </motion.button>
  );
};
