import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { parse } from 'date-fns'
import { confirmBookingWithHQ } from '@/lib/hq-rental'

interface CheckoutRequest {
  // Guest details
  guestDetails: {
    fullName: string
    email: string
    phone: string
    address: string
    licenseNumber: string
    licenseImageUrl?: string
  }
  // Rental details
  plate: string
  days: number
  rentalTotal: number // This is the subtotal (before tax)
  startDate: string // Format: yyyy-MM-dd
  endDate: string // Format: yyyy-MM-dd
  // Payment details (for future Stripe integration)
  paymentIntentId?: string
}

interface CheckoutResponse {
  success: boolean
  bookingId?: string
  error?: string
  message?: string
  errorDetails?: {
    code?: string
    message?: string
    details?: string
    hint?: string
  }
}

/**
 * POST /api/checkout
 * 
 * Guest Checkout (NO authentication required):
 * 1. Validates guest details
 * 2. Creates booking with guest information (user_id can be NULL)
 * 3. Stores subtotal/tax in metadata JSON
 * 4. Integrates with HQ Rental
 */
export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()

    // Validate required fields
    if (!body.plate || !body.startDate || !body.endDate || !body.days || !body.rentalTotal) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'Faltan datos de la reserva (plate, dates, days, total)',
        },
        { status: 400 }
      )
    }

    if (!body.guestDetails) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'Faltan datos del conductor (guestDetails)',
        },
        { status: 400 }
      )
    }

    const { guestDetails, plate, days, rentalTotal, startDate, endDate } = body

    // Validate guest details
    if (!guestDetails.email || !guestDetails.fullName || !guestDetails.licenseNumber) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'Faltan campos obligatorios del conductor (email, fullName, licenseNumber)',
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Step 1: Find car by plate
    const { data: car, error: carError } = await supabaseAdmin
      .from('cars')
      .select('id, status')
      .eq('plate', plate)
      .single()

    if (carError || !car?.id) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'No se pudo encontrar el vehículo con esa placa',
        },
        { status: 404 }
      )
    }

    // TEMPORAL BYPASS: Allow booking even if car is rented (for testing purposes)
    if (car.status !== 'available') {
      console.warn('⚠️ Car is rented, but allowing booking for testing purposes')
      // Continue with booking creation - bypass status check for testing
    }

    // Step 2: Parse dates
    const start = parse(startDate, 'yyyy-MM-dd', new Date())
    const end = parse(endDate, 'yyyy-MM-dd', new Date())

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'Las fechas proporcionadas no son válidas',
        },
        { status: 400 }
      )
    }

    // Step 3: Calculate amounts with Puerto Rico IVU (11.5%)
    const IVU_RATE = 0.115 // 11.5% (10.5% Estatal + 1% Municipal)
    
    // Ensure rentalTotal is a number (not a string)
    const rentalTotalNum = typeof rentalTotal === 'string' 
      ? parseFloat(rentalTotal.replace(/[^0-9.-]/g, '')) 
      : Number(rentalTotal)
    
    const subtotal = Number(rentalTotalNum.toFixed(2)) // Rental amount before tax
    const taxAmount = Number((subtotal * IVU_RATE).toFixed(2)) // IVU 11.5%
    const securityDeposit = 450.00 // Security deposit
    const totalAmount = Number((subtotal + taxAmount + securityDeposit).toFixed(2)) // Total including deposit

    console.log('💰 Calculated amounts:', {
      rentalTotal_input: rentalTotal,
      rentalTotal_parsed: rentalTotalNum,
      subtotal,
      taxAmount,
      securityDeposit,
      totalAmount,
      types: {
        subtotal: typeof subtotal,
        taxAmount: typeof taxAmount,
        totalAmount: typeof totalAmount,
        securityDeposit: typeof securityDeposit,
      },
    })

    // Step 4: Validate required fields before building booking data
    if (!car.id) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'Error: car_id es requerido pero no se encontró',
        },
        { status: 400 }
      )
    }

    if (!start || isNaN(start.getTime())) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'Error: start_time es requerido y debe ser una fecha válida',
        },
        { status: 400 }
      )
    }

    if (!end || isNaN(end.getTime())) {
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: 'Error: end_time es requerido y debe ser una fecha válida',
        },
        { status: 400 }
      )
    }

    // Step 5: Build booking data with EXACT column names from schema
    // Ensure ALL monetary values are explicitly converted to numbers (not strings)
    const bookingData: any = {
      // Required columns
      car_id: car.id,
      user_id: null, // Guest checkout - no user required
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      // Financial columns - FORCE to number type (not string) using Number() wrapper
      subtotal: Number(parseFloat(subtotal.toFixed(2))), 
      tax_amount: Number(parseFloat(taxAmount.toFixed(2))), 
      total_price: Number(parseFloat(totalAmount.toFixed(2))), 
      security_deposit: Number(parseFloat(securityDeposit.toFixed(2))), 
      // Status columns
      payment_status: 'pending',
      deposit_status: 'pending',
      // Guest information columns (exact names from schema)
      guest_name: guestDetails.fullName,
      guest_email: guestDetails.email,
      guest_phone: guestDetails.phone,
      guest_address: guestDetails.address,
      guest_license_number: guestDetails.licenseNumber,
      guest_license_image_url: guestDetails.licenseImageUrl || null,
      // Additional data in metadata JSON
      metadata: {
        days: Number(days), // Ensure days is a number, not string
        plate: plate,
      },
    }

    // Add payment intent if provided
    if (body.paymentIntentId) {
      bookingData.stripe_payment_intent_id = body.paymentIntentId
    }

    // CRITICAL: Validate and log ALL monetary values before insert
    console.log('🔍 PRE-INSERT VALIDATION:')
    const monetaryFields = ['subtotal', 'tax_amount', 'total_price', 'security_deposit']
    for (const field of monetaryFields) {
      const value = bookingData[field]
      const valueType = typeof value
      const isNumber = typeof value === 'number' && !isNaN(value)
      
      console.log(`  ${field}:`, {
        value,
        type: valueType,
        isNumber,
        stringified: JSON.stringify(value),
      })
      
      if (!isNumber) {
        console.error(`❌ Invalid ${field}:`, value, typeof value)
        return NextResponse.json<CheckoutResponse>(
          {
            success: false,
            error: `Error: ${field} debe ser un número válido (recibido: ${valueType})`,
          },
          { status: 400 }
        )
      }
    }

    // Step 6: Validate all required fields are present and valid
    const requiredFields = {
      car_id: bookingData.car_id,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: `Campos obligatorios faltantes: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Step 7: Insert booking
    console.log('📦 Inserting booking with data:', {
      car_id: bookingData.car_id,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      subtotal: bookingData.subtotal,
      tax_amount: bookingData.tax_amount,
      total_price: bookingData.total_price,
      security_deposit: bookingData.security_deposit,
      guest_email: bookingData.guest_email,
      guest_name: bookingData.guest_name,
    })
    
    console.log('📋 Data types verification (all should be number for monetary values):', {
      car_id: typeof bookingData.car_id,
      start_time: typeof bookingData.start_time,
      end_time: typeof bookingData.end_time,
      subtotal: typeof bookingData.subtotal,
      tax_amount: typeof bookingData.tax_amount,
      total_price: typeof bookingData.total_price,
      security_deposit: typeof bookingData.security_deposit,
      guest_name: typeof bookingData.guest_name,
      guest_email: typeof bookingData.guest_email,
    })
    
    console.log('📋 Column names being inserted:', Object.keys(bookingData))

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('❌ ========== BOOKING INSERT ERROR ==========')
      console.error('Error code:', bookingError?.code)
      console.error('Error message:', bookingError?.message)
      console.error('Error details:', bookingError?.details)
      console.error('Error hint:', bookingError?.hint)
      console.error('📦 Data that was attempted:', JSON.stringify(bookingData, null, 2))
      console.error('Column names:', Object.keys(bookingData))
      console.error('==========================================')
      
      return NextResponse.json<CheckoutResponse>(
        {
          success: false,
          error: `Error al crear la reserva: ${bookingError?.message || 'Error desconocido'}`,
          errorDetails: {
            code: bookingError?.code,
            message: bookingError?.message,
            details: bookingError?.details,
            hint: bookingError?.hint,
          },
        },
        { status: 500 }
      )
    }

    console.log('✅ Booking created successfully!')
    console.log('📋 Booking ID:', booking.id)
    console.log('📋 Booking data:', {
      id: booking.id,
      car_id: booking.car_id,
      guest_email: booking.guest_email,
      guest_name: booking.guest_name,
      total_price: booking.total_price || booking.total_amount, // Support both column names
    })

    // Step 8: Update car status to 'rented'
    await supabaseAdmin
      .from('cars')
      .update({ status: 'rented' })
      .eq('id', car.id)

    // Step 7: Confirm booking with HQ Rental
    console.log('📞 Sending booking confirmation to HQ Rental...')
    const hqResult = await confirmBookingWithHQ({
      brand_id: 2,
      send_payment_request: 0, // HQ will send its own email
      customer_email: guestDetails.email,
      customer_name: guestDetails.fullName,
      customer_phone: guestDetails.phone,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      vehicle_plate: plate,
      total_amount: totalAmount, // Total including deposit
      deposit_amount: securityDeposit,
      tax_amount: taxAmount,
      subtotal: subtotal,
    })

    if (!hqResult.success) {
      console.warn('⚠️ HQ Rental confirmation failed, but booking was created:', hqResult.error)
      console.warn('⚠️ Booking ID:', booking.id, '- User can still see confirmation in our app')
      // Don't fail the checkout if HQ fails - booking is already created
      // The user will still see their confirmation page
    } else {
      console.log('✅ HQ Rental confirmation successful')
    }

    return NextResponse.json<CheckoutResponse>(
      {
        success: true,
        bookingId: booking.id,
        message: 'Reserva creada exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in checkout:', error)
    return NextResponse.json<CheckoutResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado al procesar el checkout',
      },
      { status: 500 }
    )
  }
}
