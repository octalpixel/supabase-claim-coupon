'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import AuthForm from '@/components/auth-form'
import { CouponCard } from '@/components/coupon-card'

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [claimedCoupon, setClaimedCoupon] = useState<{
    code: string
    discount: string
    expiresAt: string
  } | null>(null)

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

  const handleClaimCoupon = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      const response = await fetch('/api/coupons/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim coupon')
      }

      setClaimedCoupon({
        code: data.coupon.code,
        discount: data.coupon.discount,
        expiresAt: new Date(data.coupon.expires_at).toLocaleDateString()
      })
      setMessage('Coupon claimed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Claim error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setClaimedCoupon(null)
    setUser(null)
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 sm:w-[350px]">
        {error && (
          <div className="w-full rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="w-full rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-400">
            {message}
          </div>
        )}

        {claimedCoupon ? (
          <CouponCard
            code={claimedCoupon.code}
            discount={claimedCoupon.discount}
            expiresAt={claimedCoupon.expiresAt}
          />
        ) : (
          <button
            onClick={handleClaimCoupon}
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Claiming...' : 'Claim Random Coupon'}
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="text-sm text-muted-foreground hover:underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
