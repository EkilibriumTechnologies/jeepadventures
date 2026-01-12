import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendAccessLinkEmail } from '@/lib/email'
import { randomUUID } from 'crypto'

/**
 * POST /api/booking/[id]/generate-access-token
 * 
 * Generates a secure access token for a booking and sends it via email.
 * This is called when the Jeep is successfully unlocked.
 */
export async function POST(
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

    // Fetch booking to get guest_email
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, guest_email, metadata')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!booking.guest_email) {
      return NextResponse.json(
        { error: 'Guest email not found for this booking' },
        { status: 400 }
      )
    }

    // Generate secure UUID token
    const accessToken = randomUUID()
    const tokenCreatedAt = new Date().toISOString()

    // Update booking metadata with access token
    const currentMetadata = (booking.metadata as Record<string, any>) || {}
    const updatedMetadata = {
      ...currentMetadata,
      access_token: accessToken,
      token_created_at: tokenCreatedAt,
    }

    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking metadata:', updateError)
      return NextResponse.json(
        { error: 'Failed to save access token', details: updateError.message },
        { status: 500 }
      )
    }

    // Send email with access link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    const accessLink = `${baseUrl}/booking/${bookingId}?token=${accessToken}`

    const emailResult = await sendAccessLinkEmail({
      email: booking.guest_email,
      accessLink,
      bookingId,
    })

    if (!emailResult.success) {
      console.error('Error sending access link email:', emailResult.error)
      // Don't fail the request if email fails, but log it
      // Token is still saved, user can request it again if needed
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Access token generated and email sent',
        tokenCreatedAt,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in generate-access-token API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
