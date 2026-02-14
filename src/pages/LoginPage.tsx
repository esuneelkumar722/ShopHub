import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import { Loader2, Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useUserStore((state) => state.setUser);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    const strength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
    setPasswordStrength(strength);
    if (!password) return 'Password is required';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with social provider');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError('Please enter your email first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      alert('Password reset email sent! Check your inbox.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    // Check password strength requirements
    const strength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    if (emailErr || passErr) {
      setEmailError(emailErr);
      setPasswordError(passErr);
      return;
    }

    // Check if password meets all requirements
    if (isSignUp && (!strength.length || !strength.uppercase || !strength.lowercase || !strength.number || !strength.special)) {
      setPasswordError('Please ensure all password requirements are met');
      return;
    }

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
          const from = location.state?.from || '/products';
          navigate(from);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4">
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

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={!!socialLoading}
            className="w-full flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>
          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={!!socialLoading}
            className="w-full flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {socialLoading === 'facebook' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            Continue with Facebook
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                className={`input pl-10 ${emailError ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
            {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
            {isSignUp && passwordFocused && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 mb-2">Password must contain:</p>
                <div className="flex items-center text-xs">
                  {passwordStrength.length ? (
                    <Check className="w-3 h-3 text-green-600 mr-2" />
                  ) : (
                    <X className="w-3 h-3 text-red-600 mr-2" />
                  )}
                  <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.uppercase ? (
                    <Check className="w-3 h-3 text-green-600 mr-2" />
                  ) : (
                    <X className="w-3 h-3 text-red-600 mr-2" />
                  )}
                  <span className={passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.lowercase ? (
                    <Check className="w-3 h-3 text-green-600 mr-2" />
                  ) : (
                    <X className="w-3 h-3 text-red-600 mr-2" />
                  )}
                  <span className={passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}>
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.number ? (
                    <Check className="w-3 h-3 text-green-600 mr-2" />
                  ) : (
                    <X className="w-3 h-3 text-red-600 mr-2" />
                  )}
                  <span className={passwordStrength.number ? 'text-green-600' : 'text-gray-500'}>
                    One number
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.special ? (
                    <Check className="w-3 h-3 text-green-600 mr-2" />
                  ) : (
                    <X className="w-3 h-3 text-red-600 mr-2" />
                  )}
                  <span className={passwordStrength.special ? 'text-green-600' : 'text-gray-500'}>
                    One special character
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary-600 hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            disabled={loading || !!emailError || !!passwordError}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setEmailError('');
              setPasswordError('');
            }}
            className="text-primary-600 hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

      </div>
    </div>
  );
};
