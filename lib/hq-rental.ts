/**
 * HQ Rental API Integration
 * Sends booking confirmation to HQ Rental system
 */

interface HQBookingData {
  brand_id: number;
  send_payment_request: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  start_date: string; // ISO format
  end_date: string; // ISO format
  vehicle_plate: string;
  total_amount: number;
  deposit_amount: number;
  tax_amount: number;
  subtotal: number;
}

interface HQResponse {
  success: boolean;
  booking_id?: string;
  error?: string;
}

/**
 * Sends booking confirmation to HQ Rental
 * @param bookingData - Booking information
 * @returns Response from HQ Rental API
 */
export async function confirmBookingWithHQ(bookingData: HQBookingData): Promise<HQResponse> {
  const hqApiUrl = process.env.HQ_RENTAL_API_URL;
  const hqApiKey = process.env.HQ_RENTAL_API_KEY;

  if (!hqApiUrl || !hqApiKey) {
    console.warn('⚠️ HQ Rental API credentials not configured. Skipping HQ confirmation.');
    return { success: true }; // Don't block the flow if HQ is not configured
  }

  try {
    const response = await fetch(hqApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hqApiKey}`,
        // Or if HQ uses a different auth method:
        // 'X-API-Key': hqApiKey,
      },
      body: JSON.stringify({
        brand_id: bookingData.brand_id,
        send_payment_request: bookingData.send_payment_request,
        customer: {
          email: bookingData.customer_email,
          name: bookingData.customer_name,
          phone: bookingData.customer_phone,
        },
        booking: {
          start_date: bookingData.start_date,
          end_date: bookingData.end_date,
          vehicle_plate: bookingData.vehicle_plate,
          amounts: {
            subtotal: bookingData.subtotal,
            tax_amount: bookingData.tax_amount,
            total_amount: bookingData.total_amount,
            deposit_amount: bookingData.deposit_amount,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('HQ Rental API error:', errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('✅ Booking confirmed with HQ Rental:', data);

    return {
      success: true,
      booking_id: data.booking_id || data.id,
    };
  } catch (error) {
    console.error('Exception calling HQ Rental API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

