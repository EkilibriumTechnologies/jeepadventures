import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendOTPEmail } from '@/lib/email'

interface SendOTPRequest {
  email: string
}

interface SendOTPResponse {
  success: boolean
  error?: string
  message?: string
  debug_code?: string // Only in development
}

/**
 * POST /api/checkout/send-otp
 * 
 * Generates a 6-digit numeric OTP code, stores it in database, and sends it via email
 * Uses Supabase Admin API to send email
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendOTPRequest = await request.json()

    if (!body.email) {
      return NextResponse.json<SendOTPResponse>(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiration to 10 minutes from now
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Try to invalidate any existing OTP codes for this email
    // (This might fail if table doesn't exist, but we'll continue)
    try {
      await supabaseAdmin
        .from('otp_codes')
        .update({ used: true })
        .eq('email', body.email.toLowerCase())
        .eq('used', false)
    } catch (updateError) {
      // Ignore update errors - table might not exist yet
      console.warn('Could not invalidate existing OTP codes:', updateError)
    }

    // Store OTP in database
    const { error: insertError } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        email: body.email.toLowerCase(),
        code: otpCode,
        expires_at: expiresAt.toISOString(),
        used: false,
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      })
      
      // Check if error is because table doesn't exist
      if (insertError.code === '42P01' || insertError.message?.includes('does not exist')) {
        return NextResponse.json<SendOTPResponse>(
          {
            success: false,
            error: 'La tabla otp_codes no existe. Por favor ejecuta la migración SQL primero. Revisa migration_create_otp_codes.sql',
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json<SendOTPResponse>(
        {
          success: false,
          error: `Error al generar el código: ${insertError.message || 'Error desconocido'}`,
        },
        { status: 500 }
      )
    }

    // Send email with OTP code via Resend
    console.log(`📧 Attempting to send OTP email to ${body.email} via Resend...`)
    const emailResult = await sendOTPEmail({ 
      email: body.email, 
      otpCode,
      // Try to get user name from existing user if available
      userName: undefined, // Could be enhanced to fetch from user profile
    })

    if (!emailResult.success) {
      console.error('❌ Failed to send email via Resend:', emailResult.error)
      console.error('📧 OTP Code (email failed, but code is valid):', otpCode)
      
      // Return error if email failed (user needs to know)
      return NextResponse.json<SendOTPResponse>({
        success: false,
        error: `Error al enviar el correo: ${emailResult.error || 'Verifica la configuración de Resend'}`,
        ...(process.env.NODE_ENV === 'development' && { debug_code: otpCode }),
      }, { status: 500 })
    } else {
      console.log(`✅ OTP email sent successfully via Resend to ${body.email}`)
    }
    
    // In development, return the code in response for testing (even if email was sent)
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json<SendOTPResponse>({
      success: true,
      message: 'Código enviado. Revisa tu correo electrónico.',
      ...(isDevelopment && { debug_code: otpCode }),
    })
  } catch (error) {
    console.error('Error in send-otp:', error)
    return NextResponse.json<SendOTPResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
