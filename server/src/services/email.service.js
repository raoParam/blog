import dotenv from 'dotenv'
dotenv.config()
import dns from 'dns'
import nodemailer from 'nodemailer'

dns.setDefaultResultOrder('ipv4first')

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port : 587,
    secure : false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family : 4
})

export const sendOTPEmail = async (emailId, otp, type) => {
    // Set email subject based on type
    const subject = type === 'email_verification' 
        ? 'Verify Your Email - Flagger' 
        : 'Reset Your Password - Flagger'  

    const message = type === 'email_verification'
        ? `Your OTP for email verification is: ${otp}. It expires in 5 minutes.`
        : `Your OTP for password reset is: ${otp}. It expires in 5 minutes.`  

    // HTML template for better looking email
    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #3B82F6; margin: 0;">Flagger</h1>
                <p style="color: #666; margin: 5px 0 0;">Blog Platform</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
                <h2 style="color: #333; margin: 0 0 10px 0;">Your OTP Code</h2>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3B82F6; margin: 20px 0; padding: 10px; background: white; border-radius: 8px;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This code expires in <strong>10 minutes</strong></p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
                <p>If you didn't request this, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Flagger. All rights reserved.</p>
            </div>
        </div>
    `

    const mailOptions = {
        from: `"Flagger" <${process.env.EMAIL_USER}>`,
        to: emailId,
        subject: subject,
        text: message,
        html: htmlTemplate
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`OTP email sent to ${emailId}`)
    } catch (error) {
        console.error('Email sending failed:', error)
        throw new Error('Failed to send email. Please try again.')
    }
}

