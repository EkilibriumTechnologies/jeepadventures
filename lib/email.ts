import { Resend } from 'resend';

// Initialize Resend client (lazy initialization to avoid errors if API key is missing)
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendOTPEmailParams {
  email: string;
  otpCode: string;
  userName?: string;
}

/**
 * Sends an OTP code via email using Resend
 */
export async function sendOTPEmail({ email, otpCode, userName }: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  // If no API key is configured, skip sending (for development)
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent. OTP code:', otpCode);
    return { success: true }; // Return success to not block the flow
  }

  const client = getResendClient();
  if (!client) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent. OTP code:', otpCode);
    return { success: true }; // Return success to not block the flow
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Jeep Adventures <onboarding@resend.dev>',
      to: email,
      subject: 'Tu código de verificación - Jeep Adventures',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px 20px; background-color: #f5f5f5;">
            <div style="max-width: 400px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 60px 40px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="font-size: 72px; font-weight: 700; color: #1a1a1a; letter-spacing: 12px; font-family: 'Courier New', monospace; margin-bottom: 20px; line-height: 1;">
                ${otpCode}
              </div>
              <p style="font-size: 14px; color: #666; margin: 0;">
                Este código expira en 10 minutos
              </p>
            </div>
          </body>
        </html>
      `,
      text: `${otpCode}\n\nEste código expira en 10 minutos`,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error: error.message || 'Error al enviar el correo' };
    }

    console.log('✅ Email sent successfully via Resend:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al enviar el correo' 
    };
  }
}

