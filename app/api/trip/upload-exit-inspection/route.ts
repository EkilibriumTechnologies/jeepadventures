import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

/**
 * POST /api/trip/upload-exit-inspection
 * 
 * Uploads an exit inspection photo to Supabase Storage bucket 'inspections'
 * Storage path: inspections/{bookingId}/exit-{side}-{timestamp}.jpg
 * 
 * This is separate from entry inspection photos to maintain legal separation.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bookingId = formData.get('bookingId') as string
    const side = formData.get('side') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!bookingId || !side) {
      return NextResponse.json(
        { error: 'Booking ID and side are required' },
        { status: 400 }
      )
    }

    // Validate side value
    const validSides = ['front', 'back', 'left', 'right']
    if (!validSides.includes(side)) {
      return NextResponse.json(
        { error: 'Invalid side. Must be: front, back, left, or right' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Generate unique filename with exit prefix and timestamp
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `exit-${side}-${timestamp}.${fileExt}`
    // Path should NOT include bucket name since it's specified in .from('inspections')
    const filePath = `${bookingId}/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('inspections')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false, // Do not overwrite existing files
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload photo', details: uploadError.message },
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

    return NextResponse.json(
      { 
        url: urlData.publicUrl, 
        path: filePath,
        side,
        timestamp 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in upload-exit-inspection API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
