import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  "https://mowgzyrspfshtgzbhshx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vd2d6eXJzcGZzaHRnemJoc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDYyMzQsImV4cCI6MjA0ODk4MjIzNH0.BY5008h0OU-TqLB_q3ndhnAQjegap4dsHTWbeVAg8Yw"
)

export async function POST(request: Request) {
  try {
    // Get a random unclaimed coupon
    const { data: availableCoupon, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .eq('claimed', false)
      .limit(1)
      .single()

    if (fetchError || !availableCoupon) {
      return NextResponse.json(
        { error: 'No available coupons found' },
        { status: 404 }
      )
    }

    // Update the coupon as claimed with timestamp and user info
    const { error: updateError } = await supabase
      .from('coupons')
      .update({ 
        claimed: true,
        claimed_at: new Date().toISOString(),
        // Note: You'll need to get the user ID from the session/auth
        // claimed_by: userId 
      })
      .eq('id', availableCoupon.id)
      .eq('claimed', false) // Extra check to prevent race conditions

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to claim coupon' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      coupon: {
        code: availableCoupon.code,
        id: availableCoupon.id
      }
    })
  } catch (error) {
    console.error('Error claiming coupon:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 