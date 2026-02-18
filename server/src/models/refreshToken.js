import mongoose from 'mongoose'

const { Schema } = mongoose

const refreshTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    deviceInfo: {
        type: String,
        default: ''
    },
    ipAddress: {
        type: String,
        default: ''
    },
    isValid: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

// Auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('RefreshToken', refreshTokenSchema)