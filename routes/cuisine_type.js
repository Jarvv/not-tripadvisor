var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");

var cuisine = require("../controllers/cuisine_type");

router.post("/insert", cuisine.insert);

module.exports = router;
