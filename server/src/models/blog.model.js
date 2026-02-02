const mongoose = require('mongoose')
const {Schema} = mongoose

const blogSchema = new Schema({
	title : {
		type : String,
		required : true,
		minLength : 5,
		maxLength : 50
	},
	content : {
		type : String,
		required : true,
	},
	author : {
		type : Schema.Types.ObjectId,
        ref : 'user',
	},
	isAnonymous : {
		type : Boolean,
		default : false
	}
},{
	timestamps : true
})