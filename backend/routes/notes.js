var express = require("express");
const NotesController = require("../controllers/NotesController");

var router = express.Router();

router.post("/createContext", NotesController.createContext);
router.post("/recordSpeech", NotesController.recordSpeech);
router.post("/generatePDF", NotesController.generatePDF);

module.exports = router;