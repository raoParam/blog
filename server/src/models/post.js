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
	visibility: {
		type: String,
		enum: ['public', 'anonymous'],
		default: 'public'
	},
	likes: [
	   {
	      type: Schema.Types.ObjectId,
	      ref: "User"
	   }
	]

},{
  	timestamps: true
})
// postSchema.index({ author: 1, createdAt: -1 }); 
// postSchema.index({ visibility: 1, createdAt: -1 })
// postSchema.index({ likes: -1 });

const Post = mongoose.model('post',postSchema)
export default Post