var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");

var Restaurant = require("../controllers/restaurant");
var Search = require("../controllers/search");

router.use(bodyParser.json({ limit: "50mb" }));

/* GET home page. */
router.get("/", function(req, res, next) {
	let popular, recent;
	var reqLoc = req.cookies["userLoc"];
	if (reqLoc != undefined) var userLoc = JSON.parse(req.cookies["userLoc"]);
	else var userLoc = "unset";

	Restaurant.getRecent().then((result, err) => {
		Search.buildRestaurantData(result, userLoc).then((result, err) => {
			recent = result;

			Restaurant.getPopular().then((result, err) => {
				Search.buildRestaurantData(result, userLoc).then(
					(result, err) => {
						popular = result;
						res.render("index", {
							title: "Home",
							loggedIn: req.session.success,
							recentRestaurants: recent,
							mostPopular: popular
						});
					}
				);
			});
		});
	});
});

module.exports = router;
