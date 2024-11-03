var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var apiResponse = require("./helpers/apiResponse");
var cors = require("cors");
const cron = require("node-cron");
const Context = require("./models/ContextModel");
const fs = require("fs");
const pdf = require("pdf-parse");
const axios = require("axios");
const OPENAI_API_KEY = "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"
// DB connection
// Directory to store files
const storageDir = path.join(__dirname, "./storage");
const tmpDir = path.join(__dirname, "./tmp");
const uploadDir = path.join(__dirname, "./uploads");

// Ensure the storage directory exists
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	//don't show the log when it is test
	if(process.env.NODE_ENV !== "test") {
		console.log("Connected to %s", MONGODB_URL);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});
var db = mongoose.connection;

var app = express();

// Cron job to run every minute
cron.schedule("* * * * *", async () => {
    console.log("Running cron job to process contexts...");

    try {
        // Fetch all contexts with extracted set to false
        const contexts = await Context.find({ extracted: false });

        for (const context of contexts) {
            try {
                // Read and extract text from the file
                const filePath = path.join(__dirname, context.file);
				console.log(filePath)
                const extractedText = await extractTextFromPDF(filePath);

                // Console log the extracted text
                console.log(`Extracted text from ${context.uuid}:`, extractedText);
				const summary = await summarizeTextWithGPT(extractedText);
                console.log(`Summary for ${context.uuid}:`, summary);

                // Update the context with the summarized text and set extracted to true
                await Context.findByIdAndUpdate(context._id, {
                    condensedInformation: summary,
					text: extractedText, // Save the summary instead of the full text
                    extracted: true
                });

                console.log(`Context ${context.uuid} updated successfully with summary.`);

                console.log(`Context ${context.uuid} updated successfully.`);
            } catch (err) {
                console.error(`Error processing context ${context.uuid}:`, err);
            }
        }
    } catch (err) {
        console.error("Error fetching contexts:", err);
    }
});

// Function to extract text from PDF using pdf-lib
async function extractTextFromPDF(filePath) {
	const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text.trim(); // Return the extracted text
}

async function summarizeTextWithGPT(text) {
    const CHUNK_SIZE = 10000; // Maximum character limit per chunk
    let accumulatedSummary = ""; // Store accumulated summary here

    try {
        // Loop over the text in chunks of 10,000 characters
        for (let i = 0; i < text.length; i += CHUNK_SIZE) {
            const textChunk = text.slice(i, i + CHUNK_SIZE);

            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are an automated note taker for a student with hearing challenges. Generate detailed, structured notes from the user content. Add explanations and examples where appropriate."
                        },
                        { role: "user", content: textChunk }
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

            // Append the summary of the current chunk to the accumulated summary
            accumulatedSummary += response.data.choices[0].message.content + "\n";
        }

        // Return the full accumulated summary after all chunks are processed
        return accumulatedSummary.trim();
    } catch (error) {
        console.error("Error summarizing text with OpenAI API:", error);
        return "Error generating summary.";
    }
}


//don't show the log when it is test
if(process.env.NODE_ENV !== "test") {
	app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use("/", indexRouter);
app.use("/api/", apiRouter);

// throw 404 if URL not found
app.all("*", function(req, res) {
	return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
	if(err.name == "UnauthorizedError"){
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

module.exports = app;
