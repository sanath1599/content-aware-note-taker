var express = require("express");
var authRouter = require("./auth");
var noteRouter = require("./notes")

var app = express();

app.use("/auth/", authRouter);
app.use("/notes/", noteRouter)

module.exports = app;