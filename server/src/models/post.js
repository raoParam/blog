import mongoose from 'mongoose'

const { Schema } = mongoose

const postSchema = new Schema({
	title: {
		type: String,
		required: true,
		minLength: 5,
		maxLength: 100  
	},
	content: {
		type: String,
		required: true,
		minLength: 10, 
		maxLength : 7000
	},
	excerpt: {
		type: String,
		minLength: 10,
		maxLength: 200
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true  
	},
    images: [{
        type: String,  // Array of image URLs (Cloudinary)
        default: []
    }],
    imagePublicIds: [{
        type: String,  // Store Cloudinary public IDs for deletion
        default: []
    }],
	visibility: {
		type: String,
		enum: ['public', 'anonymous'],
		default: 'public'
	},
	category: {
    	type: Schema.Types.ObjectId,
    	ref: 'Category'
	},
	likes: [
	   {
	      type: Schema.Types.ObjectId,
	      ref: "User"
	   }
	],
	coordinationVersion: {
		type: Number,
		default: 0
	},
	status: {
		type: String,
		enum: ['published', 'deleted'],
		default: 'published',
		index: true
	},
	cleanupStatus: {
		type: String,
		enum: ['none', 'pending', 'in_progress', 'completed', 'failed'],
		default: 'none',
		index: true
	},
	cleanupLeaseExpiresAt: {
		type: Date,
		default: null
	},
	cleanupLeaseOwner: {
		type: String,
		default: null
	},
	deletedAt: {
		type: Date,
		default: null
	}
},{
  	timestamps: true
})

postSchema.index({ status: 1, createdAt: -1 })

const Post = mongoose.model('Post',postSchema)
export default Post