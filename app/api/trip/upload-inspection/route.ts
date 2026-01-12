import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

/**
 * POST /api/trip/upload-inspection
 * 
 * Uploads an inspection photo to Supabase Storage bucket 'inspections'
 * and returns the public URL
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

    const supabaseAdmin = createAdminClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${bookingId}/${side}-${Date.now()}.${fileExt}`
    const filePath = `inspections/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('inspections')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
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
      { url: urlData.publicUrl, path: filePath },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in upload-inspection API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
