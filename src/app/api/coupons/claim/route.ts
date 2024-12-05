import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get a random unclaimed coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .is('claimed_by', null)
      .limit(1)
      .single()

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: 'No coupons available' },
        { status: 404 }
      )
    }

    // Update the coupon to mark it as claimed
    const { error: updateError } = await supabase
      .from('coupons')
      .update({ 
        claimed_by: user.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', coupon.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to claim coupon' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discount: coupon.discount || '20% OFF',
        expires_at: coupon.expires_at || new Date(Date.now() + 7*24*60*60*1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Coupon claim error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 