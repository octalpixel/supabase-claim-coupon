import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    // First, check if the coupon exists and is not claimed
    const { data: existingCoupon, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single()

    if (fetchError || !existingCoupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      )
    }

    if (existingCoupon.claimed) {
      return NextResponse.json(
        { error: 'Coupon has already been claimed' },
        { status: 400 }
      )
    }

    // Use update instead of insert to modify the existing coupon
    const { error: updateError } = await supabase
      .from('coupons')
      .update({ claimed: true })
      .eq('code', code)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to claim coupon' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error claiming coupon:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 