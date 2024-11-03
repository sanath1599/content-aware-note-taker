var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BookSchema = new Schema({
	uuid: {type: String, required: true},
	text: {type: String, required: false},
	file: {type: String, required: true},
	extracted: { type: Boolean, required: true, default: false },
	condensedInformation : { type : String, required : false},
}, {timestamps: true});

module.exports = mongoose.model("Context", BookSchema);