let cuisine = require("../../controllers/cuisine_type");
let photo = require("../../controllers/photo");
let Restaurant = require("../../controllers/restaurant");
let Search = require("../../controllers/search");
var geolib = require("geolib");

/**
 * When given the filtering info, this function gets the relevant results.
 * Step 1. Work out what actually has been filtered.
 * Step 2. Get the radius the user set and their location.
 * Step 3. Query Mongoose depending on the filter options.
 * Step 4. Build the restaurant data array and return to browser.
 * @param data - Filtering data sent from browser via socket.io
 */
exports.getRestaurants = data => {
	return new Promise((resolve, reject) => {
		data = JSON.parse(data);
		let userLoc = data[1];
		let searchToken = data[2];
		let page = data[3];
		let restaurants = [];
		console.log(data[0]);
		// Radius
		radius = getRadiusFromFilter(data[0]);

		if (searchToken != "") {
			// Search token is present
			Restaurant.getBySearch(searchToken, radius, userLoc).then(
				(result, err) => {
					Search.buildRestaurantData(result, userLoc).then(
						(result, err) => {
							filterResults(data[0], result).then(
								(result, err) => {
									resolve(Search.getPagination(result, page));
								}
							);
						}
					);
				}
			);
		} else {
			// Search token isn't preset (Usually GET)
			Restaurant.getByDistance(radius, userLoc).then((result, err) => {
				Search.buildRestaurantData(result, userLoc).then(
					(result, err) => {
						filterResults(data[0], result).then((result, err) => {
							resolve(Search.getPagination(result, page));
						});
					}
				);
			});
		}
	});
};

/**
 * Gets the radius from the filter information
 * @param  data - Filter Data
 */
function getRadiusFromFilter(data) {
	let enabled = false;
	for (let key in data) {
		if (key == "radiusEnable") enabled = true;

		if (key == "slider-radius" && enabled)
			return parseInt(data[key]) * 1609.34;
	}

	return 1000 * 1609.34;
}

/**
 * Works out if any cuisine filtering options have been pressed
 * @param data - Filter Data
 */
function getCuisineFromFilter(filterParams, data) {
	let cuisines = [];
	let restaurantData = [];
	for (let key in filterParams) {
		let split = key.split("-");
		if (split[0] == "cuisine") cuisines.push(split[1]);
	}

	if (cuisines.length == 0) {
		return data;
	} else {
		for (let cuisine in cuisines) {
			for (let key in data) {
				if (data[key].typeOfCuisine.indexOf(cuisines[cuisine]) > -1) {
					restaurantData.push(data[key]);
				}
			}
		}

		return restaurantData;
	}
}

/**
 * Gets the rating from the filter information
 * @param data - Filter Data
 */
function getRatingFromFilter(filterParams, data) {
	let rating = 0;
	let restaurantData = [];
	for (let key in filterParams) {
		if (key == "ratingStar") {
			rating = filterParams[key];
		}
	}

	if (rating == 0) {
		return data;
	} else {
		for (let key in data) {
			if (data[key].rating == rating) {
				restaurantData.push(data[key]);
			}
		}
		return restaurantData;
	}
}

/**
 * Gets the meal type from the filter information
 * @param data - Filter Data
 */
function getMealFromFilter(filterParams, data) {
	let meals = [];
	let restaurantData = [];

	for (let key in filterParams) {
		let split = key.split("-");
		if (split[0] == "meal") meals.push(split[1]);
	}

	if (meals.length == 0) {
		return data;
	} else {
		for (let meal in meals) {
			for (let key in data) {
				if (data[key].mealType.indexOf(meals[meal]) > -1) {
					restaurantData.push(data[key]);
				}
			}
		}
		return restaurantData;
	}
}

/**
 * Gets the price from the filter information
 * @param data - Filter Data
 */
function getPriceFromFilter(filterParams, data) {
	let price = 0;
	let restaurantData = [];
	for (let key in filterParams) {
		if (key == "priceRange") {
			price = filterParams[key];
		}
	}

	if (price == 0) {
		return data;
	} else {
		for (let key in data) {
			if (data[key].priceLevel >= price) {
				restaurantData.push(data[key]);
			}
		}
		return restaurantData;
	}
}

/**
 * Gets the reservation from the filter information
 * @param data - Filter Data
 */
function getReservationFromFilter(filterParams, data) {
	let enabled = false;
	let reservation = 0;
	let restaurantData = [];
	for (let key in filterParams) {
		if (key == "reservationsEnable") enabled = true;

		if (key == "reservation" && enabled)
			reservation = filterParams[key] == "0" ? false : true;
	}

	if (enabled == false) {
		return data;
	} else {
		for (let key in data) {
			if (data[key].acceptReservations == reservation) {
				restaurantData.push(data[key]);
			}
		}
		return restaurantData;
	}
}

/**
 * Gets the payment from the filter information
 * @param data - Filter Data
 */
function getPaymentFromFilter(filterParams, data) {
	let payment = [];
	let restaurantData = [];
	for (let key in filterParams) {
		let split = key.split("-");
		if (split[0] == "payment") payment.push(split[1]);
	}

	if (payment.length == 0) {
		return data;
	} else {
		for (let pay in payment) {
			for (let key in data) {
				if (data[key].paymentAccepted.indexOf(payment[pay]) > -1) {
					restaurantData.push(data[key]);
				}
			}
		}
		return restaurantData;
	}
}

/**
 * Gets the timings from the filter information
 * @param data - Filter Data
 */
function getTimesFromFilter(filterParams, data) {
	let openSlide = 0;
	let closeSlide = 0;
	let enabled = false;
	let restaurantData = [];
	for (let key in filterParams) {
		if (key == "timesEnable") enabled = true;

		if (key == "slider-time" && enabled) {
			let split = filterParams[key].split(",");
			openSlide = parseFloat(
				formatTime(split[0]).split(":")[0] +
					"." +
					formatTime(split[0]).split(":")[1]
			);
			closeSlide = parseFloat(
				formatTime(split[1]).split(":")[0] +
					"." +
					formatTime(split[1]).split(":")[1]
			);
		}
	}
	if (!enabled) {
		return data;
	} else {
		for (key in data) {
			let open = parseFloat(
				data[key].openingTime.split(":")[0] +
					"." +
					data[key].openingTime.split(":")[1]
			);
			let close = parseFloat(
				data[key].closingTime.split(":")[0] +
					"." +
					data[key].closingTime.split(":")[1]
			);
			if (open >= openSlide && close <= closeSlide) {
				restaurantData.push(data[key]);
			}
		}

		return restaurantData;
	}
}

/**
 * Makes sure the time is in the 00:00 format for the database.
 * @param time - Time string
 */
function formatTime(time) {
	if (time.length == 3) {
		time = "0" + time;
	} else if (time.length == 1) {
		time = "000" + time;
	}
	time = time.split("");
	return time[0] + time[1] + ":" + time[2] + time[3];
}

/**
 * Filters the restaurants based on the filtering results.
 * Adds linearly to the list in the order:
 * Cuisines - Rating - Meals - Price - Reservation - Payment - Times
 * @param filterParams - Filtering parameters
 * @param data - List of restaurants to compare
 */
function filterResults(filterParams, data) {
	return new Promise((resolve, reject) => {
		// Cuisines
		let cuisineData = getCuisineFromFilter(filterParams, data);
		// Rating
		let ratingData = getRatingFromFilter(filterParams, cuisineData);
		// Meal Type
		let mealsData = getMealFromFilter(filterParams, ratingData);
		// Price
		let priceData = getPriceFromFilter(filterParams, mealsData);
		// Reservations
		let reservationsData = getReservationFromFilter(
			filterParams,
			priceData
		);
		// Payment
		let paymentData = getPaymentFromFilter(filterParams, reservationsData);
		// Times
		let timeData = getTimesFromFilter(filterParams, paymentData);

		let restaurantData = makeUnique(timeData);
		resolve(restaurantData);
	});
}

/**
 * Simply ensures that no restaurant is supplied twice before browser rendering.
 * @param data - The data that has been already queried
 */
function makeUnique(data) {
	let restaurantData = [];
	// In outer results loop
	for (let i = 0; i < data.length; i++) {
		let present = false;
		// Length of restaurantData
		for (let z = 0; z < restaurantData.length; z++) {
			let dataID = new String(data[i]._id);
			let restaurantID = new String(restaurantData[z]._id);
			if (dataID.valueOf() == restaurantID.valueOf()) {
				present = true;
			}
		}
		if (!present) restaurantData.push(data[i]);
	}
	return restaurantData;
}
