import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

interface VerifyOTPRequest {
  email: string
  otpCode: string
}

interface VerifyOTPResponse {
  success: boolean
  userId?: string
  error?: string
}

/**
 * POST /api/checkout/verify-otp
 * 
 * Verifies the OTP code and returns user ID if valid
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json()

    if (!body.email || !body.otpCode) {
      return NextResponse.json<VerifyOTPResponse>(
        {
          success: false,
          error: 'Email and OTP code are required',
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Find valid OTP code
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', body.email.toLowerCase())
      .eq('code', body.otpCode)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json<VerifyOTPResponse>(
        {
          success: false,
          error: 'Código inválido o expirado',
        },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpData.id)

    // Find user by email
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    if (usersError) {
      console.error('Error listing users:', usersError)
      return NextResponse.json<VerifyOTPResponse>(
        {
          success: false,
          error: 'Error al verificar usuario',
        },
        { status: 500 }
      )
    }

    // Verify that users array exists and is an array
    if (!usersData || !Array.isArray(usersData.users)) {
      console.error('Invalid users data structure:', usersData)
      return NextResponse.json<VerifyOTPResponse>(
        {
          success: false,
          error: 'Error al verificar usuario: estructura de datos inválida',
        },
        { status: 500 }
      )
    }

    const user = usersData.users.find(
      (u) => u.email?.toLowerCase() === body.email.toLowerCase()
    )

    if (!user) {
      return NextResponse.json<VerifyOTPResponse>(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json<VerifyOTPResponse>({
      success: true,
      userId: user.id,
    })
  } catch (error) {
    console.error('Error in verify-otp:', error)
    return NextResponse.json<VerifyOTPResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

