const Context = require("../models/ContextModel");
const { body, validationResult } = require("express-validator");
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
const axios = require("axios");
const OPENAI_API_KEY = process.env.OPEN_AI_API_KEY;
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); 
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
	}
});



const upload = multer({ storage: storage });

/**
 * Create a new note.
 * 
 * @param {string} uuid
 * @param {File} file
 * @returns {Object}
 */
exports.createContext = [
	upload.single('file'),
	async function (req, res) {
		try {
			const { uuid } = req.body;
			if (!uuid) {
				return apiResponse.ErrorResponse(res, "UUID is required");
			}
			let context = await Context.find({ uuid })
			if (context.length > 0) {
				return apiResponse.ErrorResponse(res, "Context Already Exists for this UUID, generate new UUID or start speaking!")
			}
			const newNote = new Context({
				uuid: uuid,
				file: req.file.path, 
				text: "",
				extracted: false
			});

			newNote.save().then((note) => {
				return apiResponse.successResponseWithData(res, "Context created successfully, learning now!", note);
			}).catch(err => {
				console.log(err)
				return apiResponse.ErrorResponse(res, err.message);
			});
		} catch (err) {
			console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


exports.recordSpeech = [
	async function (req, res) {
		try {
			const { uuid, transcript } = req.body;

			if (!uuid || !transcript) {
				return res.status(400).json({ error: "uuid and speech are required." });
			}

			const filePath = path.join(storageDir, `${uuid}.txt`);

			fs.appendFile(filePath, transcript + "\n", (err) => {
				if (err) {
					console.error("Error writing to file:", err);
					return res.status(500).json({ error: "Could not write to file." });
				}

				return apiResponse.successResponse(res, "Speech recorded successfully!");
			});
		}
		catch (err) {
			console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

exports.generatePDF = [
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

		const tmpDir = path.join(__dirname, "../tmp");
		const pdfFilePath = path.join(tmpDir, `${uuid}.pdf`);
		const markdownFilePath = path.join(tmpDir, "temp.md");

		try {
			fs.writeFileSync(markdownFilePath, markdownContent.condensedInformation);

			markdownpdf()
				.from(markdownFilePath)
				.to(pdfFilePath, () => {
					res.setHeader("Content-Type", "application/pdf");
					res.setHeader("Content-Disposition", `attachment; filename="generated.pdf"`);
					res.sendFile(pdfFilePath, (err) => {
						if (err) {
							console.error("Error sending PDF file:", err);
						}

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

exports.generatePDF = [
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

		const tmpDir = path.join(__dirname, "../tmp");
		const pdfFilePath = path.join(tmpDir, `${uuid}.pdf`);
		const markdownFilePath = path.join(tmpDir, "temp.md");

		try {
			fs.writeFileSync(markdownFilePath, markdownContent.condensedInformation);
			markdownpdf()
				.from(markdownFilePath)
				.to(pdfFilePath, () => {
					res.setHeader("Content-Type", "application/pdf");
					res.setHeader("Content-Disposition", `attachment; filename="generated.pdf"`);
					res.sendFile(pdfFilePath, (err) => {
						if (err) {
							console.error("Error sending PDF file:", err);
						}

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

exports.chatWithPDF = [
    async function (req, res) {
        const { uuid, message } = req.body;

        if (!uuid || !message) {
            return res.status(400).send("UUID and message content are required.");
        }

        let markdownContent = await Context.findOne({ uuid }).select("condensedInformation").exec();

        if (!markdownContent || !markdownContent.condensedInformation) {
            return apiResponse.successResponse(res, "No content found for the given UUID.");
        }
		else {
			const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You will be provided with lecture notes and a question, answer the question based on the lecture notes. The first user input is the lecture notes."
                        },
                        { role: "user", content: markdownContent.condensedInformation },
						{ role: "user", content: message}
                    ],
                    temperature: 0.5
                },
                {
                    headers: {
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );
			let answer = response.data.choices[0].message.content;
			return apiResponse.successResponse(res, answer);
		}
	}
]
