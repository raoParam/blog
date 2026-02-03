import mongoose from 'mongoose'

const { Schema } = mongoose 

const userSchema = new Schema({
	firstName: {
		type: String,
		required: true,
		maxLength: 40,
		minLength: 3
	},
	lastName: {
		type: String, 
		maxLength: 40,
		minLength: 3
	},
	emailId: {      
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		immutable: true
	},
	userName: {         
		type: String,
		required: true,
		unique: true,     // ← MUST ADD THIS!
		maxLength: 40,
		minLength: 5
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
		default: ''    
	}
}, {
  timestamps: true
})


// userSchema.pre('remove', async function(next) {
//   await mongoose.model('Post').deleteMany({ author: this._id });
//   next();
// });

const User = mongoose.model('user',userSchema)
export default User