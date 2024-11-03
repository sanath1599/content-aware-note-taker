var express = require("express");
const NotesController = require("../controllers/NotesController");

var router = express.Router();

router.post("/createContext", NotesController.createContext);
router.post("/recordSpeech", NotesController.recordSpeech);

module.exports = router;