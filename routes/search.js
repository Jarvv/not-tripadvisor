var express = require("express");
var router = express.Router();
var app = express();
var io = require("socket.io").listen(8080);
var geolib = require("geolib");

var cuisine = require("../controllers/cuisine_type");
var restaurant = require("../controllers/restaurant");
var photo = require("../controllers/photo");
var search = require("../controllers/search");
var Restaurant = require("../models/restaurant");

/* 
  GET search page. 
  Only used when user clicks nav link.
*/
router.get("/", search.get);

/*
  POST search page.
  Only used when user hits 'search' from nav search bar.
*/
router.post("/", search.post);

/*
  PATCH search page.
  Only used by dynamic searching. Sends response back to ajax call.
*/
router.patch("/", search.patch);

/*
	PATCH search page
	Get map markers
 */
router.patch("/markers", function(req, res, next) {
	var ops = [];
	ops.push(getMarkers(req.body));

	Promise.all(ops).then(function(result, err) {
		res.send(JSON.stringify(result));
	});
});

module.exports = router;
