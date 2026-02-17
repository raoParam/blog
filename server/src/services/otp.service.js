import crypto from 'crypto'
import OTP from '../models/otp.js'

export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString()
}

export const saveOTP = async (emailId, otp, type) => {
    // This will work for both 'email_verification' and 'password_reset'
    await OTP.updateMany(
        { emailId, type, isUsed: false },
        { isUsed: true }
    )

    const otpRecord = await OTP.create({
        emailId,
        otp,
        type,  // 'password_reset' will be stored here
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })

    return otpRecord
}