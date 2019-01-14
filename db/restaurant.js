var mongoose = require("mongoose");
var assert = require("assert");
var ObjectId = require("mongodb").ObjectId;

var mongoDB = "mongodb://localhost:27017/restaurant";

mongoose.Promise = global.Promise;
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

module.exports = {};
