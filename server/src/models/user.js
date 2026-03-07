import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 40,
        match: /^[A-Za-z_]+$/
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 40,
        match: /^[A-Za-z_]+$/
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
        maxLength: 40,
        match: /^[a-z_]+$/
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        select : false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: { 
        type: String, 
        default: '' 
    },
    bio: {
        type: String,
        minLength: 3,
        maxLength: 500,
        default: 'Hey there! I am using Flagger'
    },
    followers: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    following: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    savedPosts: [
        { type: Schema.Types.ObjectId, ref: 'Post' }
    ],
    isVerifiedBadge: { type: Boolean, default: false },
    refreshTokenVersion: {
        type: Number,
        default: 0
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true 
    },
    accountStatus: { 
        type: String, 
        enum: ['active', 'suspended', 'deleted'],
        default: 'active' 
    }

}, { timestamps: true })



export default mongoose.model('User', userSchema)
