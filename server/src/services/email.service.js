import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
})

export const sendOTPEmail = async (to, otp, type = 'email_verification') => {
  const isPasswordReset = type === 'password_reset'

  const subject = isPasswordReset
    ? 'Reset Your Password - Flagger'
    : 'Verify Your Email - Flagger'

  const heading = isPasswordReset ? 'Password Reset' : 'Email Verification'
  const body = isPasswordReset
    ? 'Use the OTP below to reset your password:'
    : 'Use the OTP below to complete your registration:'

  await transporter.sendMail({
    from: `"Flagger" <${process.env.BREVO_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3B82F6; margin: 0;">Flagger</h1>
          <p style="color: #666; margin: 5px 0 0;">Blog Platform</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin: 0 0 10px 0;">${heading}</h2>
          <p style="color: #666;">${body}</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3B82F6; margin: 20px 0; padding: 10px; background: white; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">This OTP expires in <strong>5 minutes</strong></p>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
          <p>If you didn't request this, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Flagger. All rights reserved.</p>
        </div>
      </div>
    `,
  })

  console.log(`OTP email sent to ${to}`)
}