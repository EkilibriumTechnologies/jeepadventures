import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

interface CheckUserRequest {
  email: string
}

interface CheckUserResponse {
  exists: boolean
  error?: string
}

/**
 * POST /api/checkout/check-user
 * 
 * Checks if a user exists by email address
 */
export async function POST(request: NextRequest) {
  try {
    const body: CheckUserRequest = await request.json()

    if (!body.email) {
      return NextResponse.json<CheckUserResponse>(
        {
          exists: false,
          error: 'Email is required',
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // List all users and find by email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json<CheckUserResponse>(
        {
          exists: false,
          error: 'Error al verificar usuarios',
        },
        { status: 500 }
      )
    }

    // Find user by email (case-insensitive)
    const existingUser = existingUsers.users.find(
      (user) => user.email?.toLowerCase() === body.email.toLowerCase()
    )

    return NextResponse.json<CheckUserResponse>({
      exists: !!existingUser,
    })
  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json<CheckUserResponse>(
      {
        exists: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

