var geolib = require("geolib");
var cities = require("city-to-coords");
var cuisine = require("../controllers/cuisine_type");
var restaurant = require("../controllers/restaurant");
var photo = require("../controllers/photo");
var cities = require("../controllers/cities");
var review = require("../controllers/review");

/**
 * Control Handler for GET '/search'
 * Called when user routes to /search
 * @param req - Request from the server.
 * @param res - Response for the server.
 */
exports.get = (req, res) => {
	var reqLoc = req.cookies["userLoc"];
	if (reqLoc != undefined) {
		var userLoc = JSON.parse(req.cookies["userLoc"]);
		var locPermission = true;
	} else {
		var userLoc = "unset";
		var locPermission = false;
	}
	exports.getAll(userLoc).then((result, err) => {
		if (err) throw err;

		let [restaurants, currentPage, totalPages] = exports.getPagination(
			result[0]
		);
		res.render("search", {
			title: "Search Restaurants",
			restaurants: restaurants,
			cuisines: result[1],
			searchToken: "",
			userLoc: userLoc,
			locPermission: locPermission,
			totalPages: totalPages,
			currentPage: currentPage,
			loggedIn: req.session.success
		});
	});
};

/**
 * Control Handler for POST '/search'
 * Called when user presses Search in the nav
 * @param req - Request from the server.
 * @param res - Response for the server.
 */
exports.post = (req, res) => {
	var ops = [];

	// Default search radius
	var distanceRadius = 1000 * 1609.34;

	var reqLoc = req.cookies["userLoc"];
	if (reqLoc != undefined) {
		var userLoc = JSON.parse(req.cookies["userLoc"]);
		var locPermission = true;
	} else {
		var userLoc = "unset";
		var locPermission = false;
	}

	ops.push(cuisine.getAll());

	Promise.all(ops).then((result, err) => {
		if (err) throw err;
		let cuisines = result[0];

		cities.getFromSearch(req.body.search).then((result, err) => {
			if (userLoc == "unset" && result.length != 0)
				userLoc = {
					lat: result[0].location.coordinates[0],
					lng: result[0].location.coordinates[1]
				};
			restaurant
				.getBySearch(req.body.search, distanceRadius, userLoc)
				.then((result, err) => {
					exports
						.buildRestaurantData(result, userLoc)
						.then((result, err) => {
							let [
								restaurants,
								currentPage,
								totalPages
							] = exports.getPagination(result);

							// Finally render..
							res.render("search", {
								title: "Search Restaurants",
								restaurants: restaurants,
								cuisines: cuisines,
								searchToken: req.body.search,
								userLoc: userLoc,
								locPermission: locPermission,
								totalPages: totalPages,
								currentPage: currentPage,
								loggedIn: req.session.success
							});
						});
				});
		});
	});
};

/**
 * Control Handler for PATCH '/search'
 * Called when user types in the search bar.
 * @param req - Request from the server.
 * @param res - Response for the server.
 * */
exports.patch = (req, res) => {
	var body = {};
	body.restaurants = [];

	// Default search radius
	var distanceRadius = 1000 * 1609.34;

	var reqLoc = req.cookies["userLoc"];
	if (reqLoc != undefined) var userLoc = JSON.parse(req.cookies["userLoc"]);
	else var userLoc = "unset";

	if (userLoc != "unset") {
		restaurant
			.getBySearch(req.body.search, distanceRadius, userLoc)
			.then((result, err) => {
				exports
					.buildRestaurantData(result, userLoc)
					.then((result, err) => {
						// Limit to 5
						body.restaurants = result.slice(0, 5);
						res.writeHead(200, {
							"Content-Type": "application/json"
						});
						res.end(JSON.stringify(body));
					});
			});
	} else {
		body.restaurants = [];
		res.writeHead(200, {
			"Content-Type": "application/json"
		});
		res.end(JSON.stringify(body));
	}
};

/**
 * With all the model responses, build the restaurant object that the browser can use to render the results.
 * @param data - The data of restaurant gotten from their respective controllers.
 * @param userLoc - User Location in longitude and latitude
 */
exports.buildRestaurantData = (data, userLoc) => {
	let restaurants = [];
	for (i in data) {
		var distance =
			userLoc == "unset"
				? ""
				: getDistance(userLoc, {
						lat: data[i].location.coordinates[0],
						lng: data[i].location.coordinates[1]
				  });
		var restaurant = {
			id: data[i].id,
			_id: data[i].id,
			name: data[i].name,
			typeOfCuisine: data[i].typeOfCuisine[0],
			address: data[i].address,
			loc: data[i].location.coordinates,
			distance: distance,
			city: data[i].city,
			postcode: data[i].postcode,
			photo: "",
			mealType: data[i].mealType,
			priceLevel: data[i].priceLevel,
			acceptReservations: data[i].acceptReservations,
			paymentAccepted: data[i].paymentAccepted,
			openingTime: data[i].openingTime,
			closingTime: data[i].closingTime
		};
		restaurants.push(restaurant);
	}
	// Get Cuisine name
	// Get Photo url
	let cuisOps = [];
	let photoOps = [];
	let reviewOps = [];
	for (i in restaurants) {
		cuisOps.push(cuisine.getByID(restaurants[i].typeOfCuisine));
		photoOps.push(photo.getRestaurantIconById(restaurants[i].id));
		reviewOps.push(review.getAllForRestaurant(restaurants[i].id));
	}

	return new Promise((resolve, reject) => {
		Promise.all(cuisOps).then((c_res, err) => {
			if (err) reject(err);
			Promise.all(photoOps).then((p_res, err) => {
				if (err) reject(err);
				Promise.all(reviewOps).then((r_res, err) => {
					if (err) reject(err);

					for (i in restaurants) {
						restaurants[i].typeOfCuisine = c_res[i];
						restaurants[i].photo = p_res[i][0].photo;
						restaurants[i].rating = r_res[i][0];
						restaurants[i].ratingTotal = r_res[i][1];
					}
					resolve(restaurants);
				});
			});
		});
	});
};

/**
 * Gets the distance in miles when given two sets of longitudes and latitudes
 * @param userLocation - User's location in longitude and latitude
 * @param restaurantLocation - Restaurant's location in longitude and latitude
 */
function getDistance(userLocation, restaurantLocation) {
	var distance = geolib.getDistance(
		{
			latitude: userLocation.lat,
			longitude: userLocation.lng
		},
		{
			latitude: restaurantLocation.lat,
			longitude: restaurantLocation.lng
		}
	);
	return (distance / 1609.34).toFixed(2); // Convert to miles
}

/**
 * Get all results. Used by GET and also when filtering.
 * @param userLoc - User's location
 */
exports.getAll = userLoc => {
	return new Promise((resolve, reject) => {
		var ops = [];
		// Get all cuisines and all restaurants
		ops.push(cuisine.getAll());
		ops.push(restaurant.getAll());

		Promise.all(ops).then(function(result, err) {
			if (err) reject(err);
			var cuisines = result[0];
			var restaurantList = result[1];
			var cuisineOps = [];
			var imageOps = [];
			var reviewOps = [];

			// Get image url and cuisine of restaurants
			for (var i = 0; i < restaurantList.length; i++) {
				imageOps.push(
					photo.getRestaurantIconById(restaurantList[i].id)
				);
				cuisineOps.push(
					cuisine.getByID(restaurantList[i].typeOfCuisine)
				);
				reviewOps.push(
					review.getAllForRestaurant(restaurantList[i].id)
				);
			}

			Promise.all(cuisineOps).then(res_cuisines => {
				Promise.all(imageOps).then(res_photos => {
					Promise.all(reviewOps).then(res_rev => {
						// Apply image url and cuisine for restaurant
						for (var i = 0; i < restaurantList.length; i++) {
							restaurantList[i].distance =
								userLoc == "unset"
									? ""
									: getDistance(userLoc, {
											lat:
												restaurantList[i].location
													.coordinates[0],
											lng:
												restaurantList[i].location
													.coordinates[1]
									  });
							restaurantList[i].typeOfCuisine = res_cuisines[i];
							restaurantList[i].rating = res_rev[i][0];
							restaurantList[i].ratingTotal = res_rev[i][1];
							restaurantList[i].photo = res_photos[i][0].photo;
						}
						resolve([restaurantList, cuisines]);
					});
				});
			});
		});
	});
};

/**
 * Paginates the search results, returning only the ones required for the specific page.
 * @param restaurants - List of restaurants
 * @param currentPage - The page we are currently on (Default = 1)
 */
exports.getPagination = (restaurants, currentPage = 1) => {
	let restaurantsPerPage = 4;
	let totalRestaurants = restaurants.length;
	let totalPages = Math.ceil(totalRestaurants / restaurantsPerPage);

	let start = (currentPage - 1) * restaurantsPerPage;
	restaurants = restaurants.slice(start, start + restaurantsPerPage);

	return [restaurants, currentPage, totalPages];
};
