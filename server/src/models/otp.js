import mongoose from 'mongoose'

const { Schema } = mongoose

const otpSchema = new Schema({
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email_verification', 'password_reset'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000) 
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('OTP', otpSchema)