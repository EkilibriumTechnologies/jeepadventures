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
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

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

    // If token is provided, validate it
    if (token) {
      const metadata = (booking.metadata as Record<string, any>) || {}
      const storedToken = metadata.access_token

      if (!storedToken || storedToken !== token) {
        return NextResponse.json(
          { 
            error: 'Invalid access token',
            valid: false,
          },
          { status: 403 }
        )
      }

      // Token is valid
      return NextResponse.json({
        ...booking,
        tokenValid: true,
      }, { status: 200 })
    }

    // No token provided - return booking but mark token as not validated
    return NextResponse.json({
      ...booking,
      tokenValid: false,
    }, { status: 200 })
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

