import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: 'user',
            created_at: data.user.created_at!
          });
          navigate('/products');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-3xl font-bold text-center mb-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isSignUp ? 'Sign up to start shopping' : 'Welcome back to ShopHub'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-primary-600 hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            <strong>Note:</strong> Products visible without login. Sign in to manage cart across devices.
          </p>
        </div>
      </div>
    </div>
  );
};
