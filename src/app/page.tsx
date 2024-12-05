'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLogin, setIsLogin] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setMessage(data.message)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setMessage('Logged in successfully!')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleClaimCoupon = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/coupons/claim', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim coupon')
      }

      setCouponCode(data.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setCouponCode(null)
    setUser(null)
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setMessage(null)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Coupon Claiming App</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user ? 'Claim your exclusive coupon' : `${isLogin ? 'Login' : 'Sign up'} to claim your exclusive coupon`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg text-sm">
            {message}
          </div>
        )}

        {user ? (
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    Logged In
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email: <span className="text-foreground">{user.email}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: <span className="font-mono text-xs text-foreground">{user.id}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last Sign In: <span className="text-foreground">
                      {new Date(user.last_sign_in_at || '').toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleClaimCoupon}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 w-full"
              >
                {loading ? 'Claiming...' : 'Claim Coupon'}
              </button>

              {couponCode && (
                <div className="text-center w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Your coupon code:
                  </p>
                  <code className="block w-full bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg font-mono text-lg">
                    {couponCode}
                  </code>
                </div>
              )}

              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline mt-4"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isLogin 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !isLogin 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
