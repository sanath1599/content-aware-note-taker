const Context = require("../models/ContextModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const markdownpdf = require("markdown-pdf");
const storageDir = path.join(__dirname, "../storage");
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


exports.recordSpeech = [
	async function(req, res) {
		try{
			const { uuid, transcript } = req.body;

    if (!uuid || !transcript) {
        return res.status(400).json({ error: "uuid and speech are required." });
    }

    // Define the file path
    const filePath = path.join(storageDir, `${uuid}.txt`);

    // Append speech to file if it exists, otherwise create a new file
    fs.appendFile(filePath, transcript + "\n", (err) => {
        if (err) {
            console.error("Error writing to file:", err);
            return res.status(500).json({ error: "Could not write to file." });
        }

        return apiResponse.successResponse(res, "Speech recorded successfully!");
    });
		}
		catch(err){
			console.log(err)
			return apiResponse.ErrorResponse(res, err);	
		}
	}
]

exports.generatePDF = [
  // auth,
  async function (req, res) {
    const { uuid } = req.body;

    if (!uuid) {
      return res.status(400).send("UUID content is required.");
    }

    let markdownContent = await Context.findOne({ uuid }).select("condensedInformation").exec();
    console.log(markdownContent);

    if (!markdownContent || !markdownContent.condensedInformation) {
      return res.status(404).send("No content found for the given UUID.");
    }

    // Define a temporary directory path for PDF and markdown files
    const tmpDir = path.join(__dirname, "../tmp");
    const pdfFilePath = path.join(tmpDir, `${uuid}.pdf`);
    const markdownFilePath = path.join(tmpDir, "temp.md");

    try {
      // Write the markdown content to a temporary markdown file
      fs.writeFileSync(markdownFilePath, markdownContent.condensedInformation);

      // Convert Markdown to PDF and save to the temp path
      markdownpdf()
        .from(markdownFilePath)
        .to(pdfFilePath, () => {
          // Send the generated PDF file as a response
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename="generated.pdf"`);
          res.sendFile(pdfFilePath, (err) => {
            if (err) {
              console.error("Error sending PDF file:", err);
            }

            // Cleanup: Delete the temporary files
            fs.unlinkSync(pdfFilePath);
            fs.unlinkSync(markdownFilePath);
          });
        });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("An error occurred while generating the PDF.");
    }
  },
];exports.generatePDF = [
	// auth,
	async function (req, res) {
	  const { uuid } = req.body;
  
	  if (!uuid) {
		return res.status(400).send("UUID content is required.");
	  }
  
	  let markdownContent = await Context.findOne({ uuid }).select("condensedInformation").exec();
	  console.log(markdownContent);
  
	  if (!markdownContent || !markdownContent.condensedInformation) {
		return res.status(404).send("No content found for the given UUID.");
	  }
  
	  // Define a temporary directory path for PDF and markdown files
	  const tmpDir = path.join(__dirname, "../tmp");
	  const pdfFilePath = path.join(tmpDir, `${uuid}.pdf`);
	  const markdownFilePath = path.join(tmpDir, "temp.md");
  
	  try {
		// Write the markdown content to a temporary markdown file
		fs.writeFileSync(markdownFilePath, markdownContent.condensedInformation);
  
		// Convert Markdown to PDF and save to the temp path
		markdownpdf()
		  .from(markdownFilePath)
		  .to(pdfFilePath, () => {
			// Send the generated PDF file as a response
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", `attachment; filename="generated.pdf"`);
			res.sendFile(pdfFilePath, (err) => {
			  if (err) {
				console.error("Error sending PDF file:", err);
			  }
  
			  // Cleanup: Delete the temporary files
			  fs.unlinkSync(pdfFilePath);
			  fs.unlinkSync(markdownFilePath);
			});
		  });
	  } catch (error) {
		console.error("Error generating PDF:", error);
		res.status(500).send("An error occurred while generating the PDF.");
	  }
	},
  ];