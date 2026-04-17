const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"ELEVATE" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

const sendOtpEmail = async (to, otp) => {
  const subject = "Your ELEVATE Verification Code";
  const text = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D4AF37;">Welcome to ELEVATE</h2>
      <p>Thank you for registering. To complete your account setup, please use the following verification code:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
  return sendEmail(to, subject, text, html);
};

const sendResetPasswordEmail = async (to, resetLink) => {
  const subject = "ELEVATE - Reset Your Password";
  const text = `You requested a password reset. Please click on the following link to reset your password: ${resetLink}. This link will expire in 1 hour.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D4AF37;">ELEVATE Password Reset</h2>
      <p>You recently requested to reset your password for your ELEVATE account. Click the button below to reset it.</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #0a0a0a; color: #D4AF37; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;
  return sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendResetPasswordEmail,
};
