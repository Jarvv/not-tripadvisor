var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({dest: 'public/images/'});
var fs = require('fs');

var bodyParser = require("body-parser");

var restaurantCont = require("../controllers/restaurant");
var cuisine = require("../controllers/cuisine_type");
var photo = require("../controllers/photo");
var review = require("../controllers/review");
var user = require("../controllers/user");

var Restaurant = require("../models/restaurant");
var Photo = require("../models/photo");

var city_coords = require("city-to-coords");

router.use(bodyParser.json({ limit: "50mb" }));

/**
 * Render the add/create restaurant page.
 * This is hidden behind auth. The user must have an authenticated session else they are redirected to login.
 * @param req - Request from the user
 * @param res - Result from the server
 * @param next - Next function in the stack
 */
router.get("/createNew", function(req, res, next) {
	if (req.session.success && req.session.userId) {
		Promise.all([cuisine.getAll()]).then(function(result, err) {
			res.render("create", {
				title: "Create Restaurant",
				cuisines: result[0], 
				loggedIn: req.session.success
			});
		})

	} else {
		res.redirect('/users/login');
	}
});

/**
 * Post route for add/create a new restaurant. 
 * User must have an authenticated session, else they are redirected to login and request will not be sent to database.
 * @param upload.array('photos', 12) - Middleware function used to handle file uploads. Max 12 images.
 * @param req - Request from the user containing all form data for the new restaurant entry.
 * @param res - Result to send back to the user
 */
router.post("/addNew", upload.array('photos', 12), function(req, res, next) {
	if (req.session.success && req.session.userId) {

		// Get the available cuisine types
		Promise.all([cuisine.getAllID()]).then(function(result, err) {
			typesOfCuisine = [];
			Object.keys(req.body).forEach(function(x) {
				if(x !== 'name' && x !== 'address' && x !== 'city' && x !== 'postcode' && x !== 'website' && x !== "phone" && x !== "photos") {
					
					result[0].forEach(function(cuisine) {
						if (cuisine["name"] == x) {
							typesOfCuisine.push(cuisine["_id"])
						}
					});
				}
			});

			// Check user input for which meal types selected. Format correctly for database
			mealtypes = [];
			if (req.body.breakfast == 'on') {
				mealtypes.push('breakfast')
			}
			if (req.body.lunch == 'on') {
				mealtypes.push('lunch')
			} 
			if (req.body.dinner =='on') {
				mealtypes.push('dinner')
			}

			if (req.body.acceptRes) {
				acceptRes = true
			} else {
				acceptRes = false
			}

			payments = [];
			if (req.body.cash) {
				payments.push('cash')
			}
			if (req.body.credit) {
				payments.push('credit')
			}
			if (req.body.online) {
				payments.push('online')
			}
			
			// Get coordinates of the city for use in plotting onto the map.
			rest_coords = [];
			city_coords(req.body.city).then((coords) => {
				rest_coords.push(parseFloat(coords["lat"]));
				rest_coords.push(parseFloat(coords["lng"]));
				var date = new Date();

				// Create the new restaurant with properly formatted data
				var restaurant = new Restaurant({
					name: req.body.name,
					typeOfCuisine: typesOfCuisine,
					address: req.body.address,
					city: req.body.city,
					postcode: req.body.postcode,
					location: {type:"Point", coordinates: rest_coords },
					website: req.body.website,
					phone: req.body.phone,
					rating: 0,
					createdAt: date,
					mealType: mealtypes,
					priceLevel: parseInt(req.body.priceLevel),
					acceptReservations: acceptRes,
					paymentAccepted: payments,
					openingTime: req.body.openTime,
					closingTime: req.body.closingTime,
					userId: req.session.userId
				});

				// console.log(restaurant);

				// Save the new entry
				restaurant.save(function(err, results) {
					if (err) throw err;

					var restaurantId = results._id;

					// If success, redirect the user to their newly created page.
					res.redirect("/restaurant/" + restaurantId);

					// Handle Images addition to Photo database.
					// Images from the camera take priority over those uploaded from the file system
					if (req.body.cameraImage.length > 1) {
						var date = new Date().getTime();
						var path = "public/images/";
						var fileName = restaurantId + date;
						// Get image data from field in request
						var image = req.body.cameraImage.replace(/^data:image\/\w+;base64,/, "");
						var buf = new Buffer(image, 'base64');
						fs.writeFile(path + fileName + '.png', buf);

						path = "/images/" + fileName + '.png'
						// Add image to the database with relating restaurantId
						Photo.create({
							photo: path,
							restaurantId: restaurantId,
							icon: true,
							official: true
						});
					} else if (req.files.length == 0) {
						// If no image is added, use the default.
						// Validation should block this from being called but will help with any error handling
						Photo.create({
							photo: "/images/restaurant_default.png",
							restaurantId: restaurantId,
							icon: true,
							official: true
						});
					} else {
						// Using photos from the file upload. Assume first uploaded as icon.
						first = req.files[0].originalname;
						req.files.forEach(function(image) {
							imagepath = image.path.substring(6);
							
							if (image.originalname == first) {
								iconBool = true
							} else {
								iconBool = false
							}

							Photo.create({
								photo: imagepath,
								restaurantId: restaurantId,
								icon: iconBool,
								official: true
							});
						});
					}
				
				});
			});
			
		});
	}
})

/**
 * Post for sending edited restaurant data to update the entry.
 * User must have an authenticated session.
 * User must be the owner (Creator) of the restaurant to send this request.
 * Similar function contents to create except uses the update funcion instead of create.
 */
router.post('/edit/send/', function(req, res, next) {
	if (req.session.success && req.session.userId) {

		var ops = [];
		var restaurantId = req.header('Referer').substr(-24);
		ops.push(restaurantCont.getById(restaurantId));
		Promise.all(ops).then(function(result) {
			if (req.session.userId == result[0].userId) {
				Promise.all([cuisine.getAllID()]).then(function(result, err) {
					typesOfCuisine = [];
					Object.keys(req.body).forEach(function(x) {
						if(x !== 'name' && x !== 'address' && x !== 'city' && x !== 'postcode' && x !== 'website' && x !== "phone" && x !== "photos") {
							
							result[0].forEach(function(cuisine) {
								if (cuisine["name"] == x) {
									typesOfCuisine.push(cuisine["_id"])
								}
							});
						}
					});

					mealtypes = [];
					if (req.body.breakfast == 'on') {
						mealtypes.push('breakfast')
					}
					if (req.body.lunch == 'on') {
						mealtypes.push('lunch')
					} 
					if (req.body.dinner =='on') {
						mealtypes.push('dinner')
					}

					if (req.body.acceptRes) {
						acceptRes = true
					} else {
						acceptRes = false
					}

					payments = [];
					if (req.body.cash) {
						payments.push('cash')
					}
					if (req.body.credit) {
						payments.push('credit')
					}
					if (req.body.online) {
						payments.push('online')
					}

					rest_coords = [];
					city_coords(req.body.city).then((coords) => {
						rest_coords.push(parseFloat(coords["lat"]));
						rest_coords.push(parseFloat(coords["lng"]));
						var date = new Date();

						Restaurant.update({'_id': restaurantId}, {$set:{
							name: req.body.name,
							typeOfCuisine: typesOfCuisine,
							address: req.body.address,
							city: req.body.city,
							postcode: req.body.postcode,
							location: {type:"Point", coordinates: rest_coords },
							website: req.body.website,
							phone: req.body.phone,
							rating: 0,
							createdAt: date,
							mealType: mealtypes,
							priceLevel: parseInt(req.body.priceLevel),
							acceptReservations: acceptRes,
							paymentAccepted: payments,
							openingTime: req.body.openTime,
							closingTime: req.body.closingTime,
							userId: req.session.userId
						}}, function(err, results) {
							if (err) throw err;

							// If successful, redirect user to their updated restaurant page.
							res.redirect("/restaurant/" + restaurantId);
						});					
					});
				});
			}
		});
	}
});

/**
 * Render the edit restaurant page. This is the create form but with prepopulated data from the restaurant.
 * User must have an authenticated session and be the owner(Creator) of the restaurant else they are redirected to the search page
 */
router.get('/edit/:id', function(req, res) {
	if (req.session.success && req.session.userId) {
		var ops = [];
		ops.push(restaurantCont.getById(req.params.id));
		ops.push(cuisine.getAllID())

		Promise.all(ops).then(function(result) {
			if (req.session.userId == result[0].userId) {
				var restaurant = result[0];
				var cuisines = result[1];

				console.log(cuisines);

				res.render('edit', {
					title: 'Edit Restaurant',
					restaurant: restaurant,
					cuisines: cuisines,
					loggedIn: req.session.success
				});
			} else {
				res.redirect('/search');
			}
		})
	} else {
		res.redirect('/search');
	}

});

router.post("/insert", restaurantCont.insert);

/**
 * Get for restaurant by Id.
 * Render the restaurant page with all related restaurant data to the restaurant Id.
 */
router.get("/:id", function(req, res) {
	var ops = [];
	ops.push(restaurantCont.getById(req.params.id));

	Promise.all(ops).then(function(result) {
		var restaurant = result[0];

		var userId = req.session.userId;
		var restaurantOps = [];
		restaurantOps.push(cuisine.getByID(restaurant.typeOfCuisine));
		restaurantOps.push(review.getByRestaurantId(restaurant.id, 1));
		restaurantOps.push(photo.getByRestaurantId(restaurant.id,0));
		restaurantOps.push(
			restaurantCont.getByCuisine(restaurant.typeOfCuisine)
		);
		restaurantOps.push(review.getUsersReview(restaurant.id, userId));
		restaurantOps.push(photo.getPhotoNumber(restaurant.id));
        restaurantOps.push(
            review.getAllForRestaurant(restaurant.id)
        );

		Promise.all(restaurantOps).then(function(results) {
			var cuisines = results[0];
			var reviews = results[1];
			var photos = results[2];
			var otherRestaurants = results[3];
			var userReview = results[4][0];
			var photoNumber = results[5];
            var rating = results[6][0];
            var reviewNumber = results[6][1];

			if (userReview === undefined) {
				userReview = {
					rating: "",
					review: "",
					title: ""
				};
			}

			restaurant.typeOfCuisine = cuisines;
			restaurant.rating = rating;

			var imageOps = [];
			for (var i = 0; i < otherRestaurants.length; i++) {
				imageOps.push(
					photo.getRestaurantIconById(otherRestaurants[i].id)
				);
			}

			Promise.all(imageOps).then(function(res_images) {
				for (var i = 0; i < res_images.length; i++) {
					otherRestaurants[i].photos.push(res_images[i][0].photo);
				}

				res.render("restaurant", {
					title: "Restaurant",
					restaurant: restaurant,
					reviews: reviews,
					otherRestaurants: otherRestaurants,
					reviewNumber: reviewNumber,
					userReview: userReview,
					photos: photos,
					photoNumber: photoNumber,
					loggedIn: req.session.success,
					userId: req.session.userId
				});
			});
		});
	});
});

router.post("/restaurant", restaurantCont.getName);

module.exports = router;
