var express = require("express");
const NotesController = require("../controllers/NotesController");

var router = express.Router();

router.post("/createContext", NotesController.createContext);

module.exports = router;