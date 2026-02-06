import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 40
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 40
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        immutable: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 5,
        maxLength: 40
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: {
        type: String,
        minLength: 3,
        maxLength: 500,
        default: 'Hey there! I am using BlogApp'
    }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
