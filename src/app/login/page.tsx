'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/lib/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false
    });

    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
      return;
    }
    router.push('/home');
    router.refresh();
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await registerAction(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setMode('login');
    setError(null);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex w-full max-w-3xl rounded-lg overflow-hidden shadow-xl">
        {/* Branding panel */}
        <div className="hidden md:flex md:w-2/5 bg-flipkart-blue text-white flex-col justify-between p-8">
          <div>
            <h1 className="text-3xl italic font-bold mb-2">Flipkart</h1>
            <p className="text-lg font-medium">
              {mode === 'login' ? 'Login' : 'Looks like you\u2019re new here!'}
            </p>
            <p className="text-sm text-white/80 mt-2">
              {mode === 'login'
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Sign up with your email to get started'}
            </p>
          </div>
          <div className="text-xs text-white/60">Smart Wishlist Management System</div>
        </div>

        {/* Form panel */}
        <div className="flex-1 bg-white p-8 space-y-4">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <input
                name="email"
                type="email"
                required
                placeholder="Enter Email"
                className="w-full border-b-2 border-gray-200 focus:border-flipkart-blue outline-none py-2 text-sm"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Enter Password"
                className="w-full border-b-2 border-gray-200 focus:border-flipkart-blue outline-none py-2 text-sm"
              />
              <p className="text-xs text-gray-500">
                By continuing, you agree to Flipkart&apos;s Terms of Use and Privacy Policy.
              </p>

              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-flipkart-orange text-white font-bold py-3 rounded-sm shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
              >
                {loading ? 'Logging in\u2026' : 'Login'}
              </button>

              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/home' })}
                className="w-full border border-gray-300 text-gray-700 font-bold py-3 rounded-sm hover:bg-gray-50"
              >
                Continue with Google
              </button>

              <div className="flex items-center justify-between text-sm pt-2">
                <button type="button" className="text-flipkart-blue font-medium">
                  Forgot Password?
                </button>
                <button type="button" onClick={() => setMode('signup')} className="text-flipkart-blue font-bold">
                  New to Flipkart? Sign Up
                </button>
              </div>

              <p className="text-xs text-gray-400 pt-2">Demo login: demo@flipkart.test / password123</p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <input
                name="name"
                required
                placeholder="Full Name"
                className="w-full border-b-2 border-gray-200 focus:border-flipkart-blue outline-none py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Enter Email"
                className="w-full border-b-2 border-gray-200 focus:border-flipkart-blue outline-none py-2 text-sm"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Create Password"
                className="w-full border-b-2 border-gray-200 focus:border-flipkart-blue outline-none py-2 text-sm"
              />

              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-flipkart-orange text-white font-bold py-3 rounded-sm shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
              >
                {loading ? 'Creating account\u2026' : 'Sign Up'}
              </button>

              <button type="button" onClick={() => setMode('login')} className="w-full text-flipkart-blue font-bold text-sm pt-2">
                Existing user? Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
