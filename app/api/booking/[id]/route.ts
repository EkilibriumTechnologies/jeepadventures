import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

/**
 * GET /api/booking/[id]
 * 
 * Fetches booking details by ID using admin client
 * This allows guests to view their bookings without authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Fetch booking with car details
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        cars (
          plate,
          smartcar_id
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error) {
      console.error('❌ Error fetching booking:', error)
      return NextResponse.json(
        {
          error: 'Booking not found',
          details: error.message,
        },
        { status: 404 }
      )
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in booking API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

