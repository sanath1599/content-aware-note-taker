const Context = require("../models/ContextModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify your upload folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});



const upload = multer({ storage: storage });
// Book Schema
function BookData(data) {
	this.id = data._id;
	this.title= data.title;
	this.description = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}
/**
 * Create a new note.
 * 
 * @param {string} uuid
 * @param {File} file
 * @returns {Object}
 */
exports.createContext = [
    // auth,
    upload.single('file'), // Expecting the file to be sent with the key "file"
    async function (req, res) {
        try {
            // Validate uuid
            const { uuid } = req.body;
            if (!uuid) {
                return apiResponse.ErrorResponse(res, "UUID is required");
            }
			let context = await Context.find({ uuid })
			if(context.length>0){
				return apiResponse.ErrorResponse(res, "Context Already Exists for this UUID, generate new UUID or start speaking!")
			}
            // Create a new note with uuid, file path, and default values for text and extracted
            const newNote = new Context({
                uuid: uuid,
                file: req.file.path, // Store the file path
                text: "",
                extracted: false
            });

            // Save the note to the database
            newNote.save().then((note) => {
                return apiResponse.successResponseWithData(res, "Context created successfully, learning now!", note);
            }).catch(err => {
				console.log(err)
                return apiResponse.ErrorResponse(res, err.message);
            });
        } catch (err) {
            // Handle errors with status 500
			console.log(err)
            return apiResponse.ErrorResponse(res, err);
        }
    }
];
