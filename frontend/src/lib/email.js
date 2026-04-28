import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an OTP email to the user.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.otp - The OTP code
 * @param {string} params.purpose - 'signup' | 'recovery' | 'login'
 */
export async function sendOtpEmail({ to, otp, purpose = 'login' }) {
  const isProduction = process.env.NODE_ENV === 'production';
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  // 1. Development Fallback
  if (!apiKey || !isProduction) {
    console.log('-----------------------------------------');
    console.log(`[Email Mock] To: ${to}`);
    console.log(`[Email Mock] Purpose: ${purpose}`);
    console.log(`[Email Mock] OTP: ${otp}`);
    console.log('-----------------------------------------');
    
    // In development, if we have an API key, we might still want to try sending it
    // but we return success regardless to not block the dev flow.
    if (!apiKey) return { success: true, mocked: true };
  }

  // 2. Production Email Sending
  try {
    const copy = {
      signup: {
        subject: 'Verify your ELEVATE account',
        intro: 'Use this code to verify your ELEVATE account.',
      },
      recovery: {
        subject: 'Recover your ELEVATE access',
        intro: 'Use this code to recover access to your ELEVATE account.',
      },
      login: {
        subject: 'Your ELEVATE access code',
        intro: 'Use this code to sign in to ELEVATE.',
      },
    }[purpose] || {
      subject: 'Your ELEVATE access code',
      intro: 'Use this code to continue.',
    };

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: copy.subject,
      html: `
        <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h1 style="font-weight: 100; letter-spacing: 0.2em; text-align: center;">ELEVATE</h1>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 16px; line-height: 1.6;">${copy.intro}</p>
          <div style="background: #f9f9f9; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <span style="font-size: 32px; letter-spacing: 0.3em; font-weight: bold;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} ELEVATE Luxury. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending exception:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
