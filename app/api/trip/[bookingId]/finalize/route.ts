import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

/**
 * POST /api/trip/[bookingId]/finalize
 * 
 * Finalizes a trip by:
 * - Saving exit inspection photo URLs to the booking
 * - Marking the booking as completed
 * - Updating car status to available
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId
    const body = await request.json()
    const { exitPhotos } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    if (!exitPhotos || !Array.isArray(exitPhotos) || exitPhotos.length !== 4) {
      return NextResponse.json(
        { error: 'All 4 exit photos are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Fetch booking to get car_id and existing photos_urls
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, car_id, photos_urls')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Append exit photos to existing photos_urls array
    // Entry photos may already exist, so we append rather than overwrite
    const existingPhotos = Array.isArray(booking.photos_urls) ? booking.photos_urls : []
    const updatedPhotosUrls = [...existingPhotos, ...exitPhotos]

    // Update booking with exit photos and mark as completed
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        end_time: new Date().toISOString(),
        // Append exit photos to photos_urls array (entry photos may already exist)
        photos_urls: updatedPhotosUrls,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Update booking error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking', details: updateError.message },
        { status: 500 }
      )
    }

    // Update car status to available
    const { error: carUpdateError } = await supabaseAdmin
      .from('cars')
      .update({
        status: 'available',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.car_id)

    if (carUpdateError) {
      console.error('Update car error:', carUpdateError)
      // Don't fail the request if car update fails, but log it
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Trip finalized successfully',
        bookingId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in finalize API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
