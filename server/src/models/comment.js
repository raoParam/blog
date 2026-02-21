import mongoose from 'mongoose'

const { Schema } = mongoose

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 1000
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true })

// Index for faster queries
commentSchema.index({ post: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)