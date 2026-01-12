import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

/**
 * POST /api/active-rental/upload-license
 * 
 * Uploads a driver's license photo to Supabase Storage
 * and saves the URL to the booking's guest_license_image_url column
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bookingId = formData.get('bookingId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    // Path should NOT include bucket name since it's specified in .from('inspections')
    // Store licenses in a 'licenses' folder within the inspections bucket
    const filePath = `licenses/${bookingId}/license-${Date.now()}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage (using 'inspections' bucket or create 'licenses' bucket)
    // For now, using 'inspections' bucket with a 'licenses' folder
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('inspections')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload license photo', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('inspections')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get photo URL' },
        { status: 500 }
      )
    }

    // Update booking with license image URL
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        guest_license_image_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Update booking error:', updateError)
      // Don't fail the request, but log the error
      // The photo is uploaded, we can retry the update later if needed
    }

    return NextResponse.json(
      { url: urlData.publicUrl, path: filePath },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in upload-license API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
