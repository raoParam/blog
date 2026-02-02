const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
	firstName : {
		type : String,
		required : true,
		maxLength : 40,
		minLength : 3
	},
	lastName : {
		type : String, 
		maxLength : 40,
		minLength : 3
	},
	emailId : {
		type : String,
		required : true,
		unique : true,
		trim : true,
		lowercase : true,
		immutable : true
	},
	userName : {
		type : String,
		required : true,
		maxLength : 40,
		minLength : 5
	},
	password : {
		type : String,
		required : true,
		minLength : 8,
		select : false
	},
	gender : {
		type : String,
		enum : ["male","female","other"]
	},
	role : {
		type : String,
		enum : ['user','admin'],
		default : 'user'
	}
},{
	timestamps : true
})

const User = mongoose.model('user',userSchema)
module.exports = User