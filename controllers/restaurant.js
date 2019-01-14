var Restaurant = require("../models/restaurant");
var CuisineCont = require("../controllers/cuisine_type");

/**
 * Query using the id of the restaurant, returning the full details of the result
 * @param id - The id of the restaurant.
 */
exports.getById = id => {
	return new Promise((resolve, reject) => {
		Restaurant.find({
			_id: id
		}).then((result, err) => {
			if (err) reject(err);
			resolve(result[0]);
		});
	});
};

/**
 * Returns the first five results of restaurants with the same cuisine
 * @param cuisine - Type of restaurant cuisine
 */
exports.getByCuisine = function(cuisine) {
	return new Promise(function(resolve, reject) {
		Restaurant.find(
			{
				typeOfCuisine: cuisine
			},
			"name _id rating photos",
			function(err, restaurants) {
				if (err) reject(err);
				resolve(restaurants);
			}
		).limit(4);
	});
};

/**
 * Query returning the name and typeOfCuisine.
 * @param req - Request from the server.
 * @param res - Response for the server.
 */
exports.getName = function(req, res) {
	var userData = req.body;
	if (userData == null) {
		res.status(403).send("No data sent!");
	}
	try {
		Restaurant.find(
			{
				name: userData.name,
				typeOfCuisine: userData.typeOfCuisine
			},
			"restaurantId name typeOfCuisine address",
			function(err, restaurants) {
				if (err) {
					res.status(500).send("Invalid Data");
				}
				var restaurant = null;
				if (restaurants.length > 0) {
					var firstElem = restaurants[0];
					restaurant = {
						id: firstElem.restaurantId,
						name: firstElem.name,
						typeOfCuisine: firstElem.typeOfCuisine,
						address: firstElem.address
					};
				}
				res.sendHeader("Content-Type", "application/json");
				res.send(JSON.stringify(restaurant));
			}
		);
	} catch (e) {
		res.status(500).send("error" + e);
	}
};

/**
 * Insert a new restaurant into the collection.
 * @param req - Request from the server.
 * @param res - Response for the server.
 */
exports.insert = function(req, res) {
	console.log("restaurant");
	var userData = req.body;
	if (userData == null || JSON.stringify(userData) === "{}") {
		res.status(403).send("No data sent!");
		return false;
	}
	try {
		var restaurant = new Restaurant({
			name: userData.name,
			typeOfCuisine: [userData.cuisineID],
			address: userData.address,
			postcode: userData.postcode,
			longitude: userData.longitude,
			latitude: userData.latitude,
			website: userData.website,
			phone: userData.phone,
			photos: [userData.photoID]
		});
		console.log("received: " + restaurant);

		restaurant.save(function(err, results) {
			if (err) throw err;
			console.log(results._id);
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(restaurant));
		});
	} catch (e) {
		res.status(500).send("error " + e);
	}
};

/**
 * Empty query to return all restaurants in the collection.
 */
exports.getAll = () => {
	return new Promise(function(resolve, reject) {
		Restaurant.find({}).then((results, err) => {
			if (err) reject(err);
			restaurants = [];
			for (var i = 0; i < results.length; i++) {
				restaurant = {};
				restaurant.id = results[i].id;
				restaurant.name = results[i].name;
				restaurant.typeOfCuisine = results[i].typeOfCuisine[0];
				restaurant.location = results[i].location;
				restaurant.priceLevel = results[i].priceLevel;
				restaurant.acceptsReservations = results[i].acceptReservations;
				restaurant.mealType = results[i].mealType;
				restaurants.push(restaurant);
			}
			resolve(restaurants);
		});
	});
};

/**
 * Query based on distance from the user.
 * @param radius - Radius of search the user has selected
 * @param userLoc - Location of the user
 */
exports.getByDistance = function(radius, userLoc) {
	return new Promise(function(resolve, reject) {
		if (userLoc != "unset") {
			Restaurant.find({
				location: {
					$near: {
						$geometry: {
							type: "Point",
							coordinates: [userLoc.lat, userLoc.lng]
						},
						$maxDistance: radius
					}
				}
			}).then((res, err) => {
				resolve(res);
			});
		} else {
			Restaurant.find().then((res, err) => {
				resolve(res);
			});
		}
	});
};

/**
 * Update the rating of the restaurant
 * @param id - The id of the restaurant
 * @param rating - The new rating
 */
exports.updateRating = function(id, rating) {
	return new Promise(function(resolve, reject) {
		Restaurant.update(
			{
				_id: id
			},
			{
				$set: {
					rating: rating
				}
			},
			function(err, results) {
				if (err) reject(err);
				resolve(results);
			}
		);
	});
};
/**
 * Query based on the current filter parameters.
 * @param cuisines - List of cuisines being filtered.
 * @param raidus - Current value of radius slider.
 * @param userLoc - Users location.
 */
exports.getFilterSearch = (cuisines, radius, userLoc) => {
	return new Promise((resolve, reject) => {
		Restaurant.find({
			$and: [
				{
					location: {
						$near: {
							$geometry: {
								type: "Point",
								coordinates: [userLoc.lat, userLoc.lng]
							},
							$maxDistance: radius
						}
					},
					typeOfCuisine: {
						$in: cuisines
					}
				}
			]
		}).then((results, err) => {
			resolve(results);
		});
	});
};

/**
 * Returns all restaurants in the database with their ID, used in seeding.
 */
exports.getAllID = () => {
	return new Promise((resolve, reject) => {
		Restaurant.find({}, "name _id").then((results, err) => {
			if (err) reject(err);

			restaurants = [];

			for (var i = 0; i < results.length; i++) {
				restaurant = {
					name: results[i].name,
					_id: results[i]._id
				};

				restaurants.push(restaurant);
			}
			resolve(restaurants);
		});
	});
};

/**
 * Retrieve the locations of the restaurants in the list.
 * @param restaurantList - List of restaurants for querying the db.
 */
getMarkers = function(restaurantList) {
	return new Promise(function(resolve, reject) {
		let mapped = restaurantList.map(w => {
			return new RegExp(w, "i");
		});
		Restaurant.find({
			name: {
				$in: mapped
			}
		}).then((results, err) => {
			if (err) reject(err);
			var markers = [];
			for (var i = 0; i < results.length; i++) {
				var marker = {
					name: results[i].name,
					lat: results[i].location.coordinates[0],
					lng: results[i].location.coordinates[1],
					id: results[i]._id,
					address: results[i].address,
					city: results[i].city,
					phone: results[i].phone,
					postcode: results[i].postcode
				};
				markers.push(marker);
			}
			resolve(markers);
		});
	});
};

/**
 * When a user uses the search bar this is called. It checks if the query has any matches in the following:
 * Phone Number, Cuisine, Postcode, Address, City, and Restaurant Name.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
exports.getBySearch = (query, radius, userLoc) => {
	return new Promise((resolve, reject) => {
		let queryArray = getTerms(query);
		let ops = [];
		for (i in queryArray) {
			query = queryArray[i];
			ops.push(getNumber(query, radius, userLoc));
			ops.push(getCuisine(query, radius, userLoc));
			ops.push(getPostcode(query, radius, userLoc));
			ops.push(getAddress(query, radius, userLoc));
			ops.push(getCity(query, radius, userLoc));
			ops.push(getName(query, radius, userLoc));
			ops.push(getMeal(query, radius, userLoc));
		}

		Promise.all(ops).then((res, err) => {
			if (err) reject(err);
			let restaurantData = exports.makeUnique(res);
			resolve(restaurantData);
		});
	});
};

/** ========= Supporting functions for getBySearch() ========= */
/**
 * Splits the search query from the AND operator and returns.
 * @param query - The query itself
 */
function getTerms(query) {
	return query.split(" AND ");
}

/**
 * Searches if the query contains part of a phone number. Returns a matching restaurant if so.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
function getNumber(query, radius, userLoc) {
	return new Promise((resolve, reject) => {
		if (userLoc != "unset") {
			Restaurant.find({
				$and: [
					{
						phone: {
							$regex: query,
							$options: "i"
						}
					},
					{
						location: {
							$near: {
								$geometry: {
									type: "Point",
									coordinates: [userLoc.lat, userLoc.lng]
								},
								$maxDistance: radius
							}
						}
					}
				]
			}).then((results, err) => {
				resolve(results);
			});
		} else {
			Restaurant.find({
				phone: {
					$regex: query,
					$options: "i"
				}
			}).then((results, err) => {
				resolve(results);
			});
		}
	});
}

/**
 * Searches if the query contains part of a cuisine. Returns a matching restaurant if so.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
function getCuisine(query, radius, userLoc) {
	return new Promise((resolve, reject) => {
		CuisineCont.getID(query, true).then((res, err) => {
			if (err) reject(err);
			if (res.length == 0) resolve([]);
			else {
				let results = [];
				for (r in res) results.push(res[r]._id);

				if (userLoc != "unset") {
					Restaurant.find({
						$and: [
							{
								typeOfCuisine: {
									$in: results
								},
								location: {
									$near: {
										$geometry: {
											type: "Point",
											coordinates: [
												userLoc.lat,
												userLoc.lng
											]
										},
										$maxDistance: radius
									}
								}
							}
						]
					}).then((results, err) => {
						resolve(results);
					});
				} else {
					Restaurant.find({
						typeOfCuisine: {
							$in: results
						}
					}).then((results, err) => {
						resolve(results);
					});
				}
			}
		});
	});
}

/**
 * Searches if the query contains part of a postcode. Returns a matching restaurant if so.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
function getPostcode(query, radius, userLoc) {
	return new Promise((resolve, reject) => {
		if (userLoc != "unset") {
			Restaurant.find({
				$and: [
					{
						postcode: {
							$regex: query,
							$options: "i"
						}
					},
					{
						location: {
							$near: {
								$geometry: {
									type: "Point",
									coordinates: [userLoc.lat, userLoc.lng]
								},
								$maxDistance: radius
							}
						}
					}
				]
			}).then((results, err) => {
				resolve(results);
			});
		} else {
			Restaurant.find({
				postcode: {
					$regex: query,
					$options: "i"
				}
			}).then((results, err) => {
				resolve(results);
			});
		}
	});
}

/**
 * Searches if the query contains part of an address. Returns a matching restaurant if so.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
function getAddress(query, radius, userLoc) {
	return new Promise((resolve, reject) => {
		if (userLoc != "unset") {
			Restaurant.find({
				$and: [
					{
						address: {
							$regex: query,
							$options: "i"
						}
					},
					{
						location: {
							$near: {
								$geometry: {
									type: "Point",
									coordinates: [userLoc.lat, userLoc.lng]
								},
								$maxDistance: radius
							}
						}
					}
				]
			}).then((results, err) => {
				resolve(results);
			});
		} else {
			Restaurant.find({
				address: {
					$regex: query,
					$options: "i"
				}
			}).then((results, err) => {
				resolve(results);
			});
		}
	});
}

/**
 * Searches if the query contains part of a city name. Returns a matching restaurant if so.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
function getCity(query, radius, userLoc) {
	return new Promise((resolve, reject) => {
		if (userLoc != "unset") {
			Restaurant.find({
				$and: [
					{
						city: {
							$regex: query,
							$options: "i"
						}
					},
					{
						location: {
							$near: {
								$geometry: {
									type: "Point",
									coordinates: [userLoc.lat, userLoc.lng]
								},
								$maxDistance: radius
							}
						}
					}
				]
			}).then((results, err) => {
				resolve(results);
			});
		} else {
			Restaurant.find({
				city: {
					$regex: query,
					$options: "i"
				}
			}).then((results, err) => {
				resolve(results);
			});
		}
	});
}

/**
 * Searches if the query contains part of a restaurant name. Returns a matching restaurant if so.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
function getName(query, radius, userLoc) {
	return new Promise((resolve, reject) => {
		if (userLoc != "unset") {
			Restaurant.find({
				$and: [
					{
						name: {
							$regex: query,
							$options: "i"
						}
					},
					{
						location: {
							$near: {
								$geometry: {
									type: "Point",
									coordinates: [userLoc.lat, userLoc.lng]
								},
								$maxDistance: radius
							}
						}
					}
				]
			}).then((results, err) => {
				resolve(results);
			});
		} else {
			Restaurant.find({
				name: {
					$regex: query,
					$options: "i"
				}
			}).then((results, err) => {
				resolve(results);
			});
		}
	});
}

/**
 * Searches if the query contains a meal type. Returns a matching restaurant if so.
 * @param query - The search query itself
 * @param radius - The radius to search around
 * @param userLoc - The user's current location
 */
function getMeal(query, radius, userLoc) {
	return new Promise((resolve, reject) => {
		if (userLoc != "unset") {
			Restaurant.find({
				$and: [
					{
						mealType: {
							$in: [query]
						},
						location: {
							$near: {
								$geometry: {
									type: "Point",
									coordinates: [userLoc.lat, userLoc.lng]
								},
								$maxDistance: radius
							}
						}
					}
				]
			}).then((results, err) => {
				resolve(results);
			});
		} else {
			Restaurant.find({
				mealType: {
					$in: [query]
				}
			}).then((results, err) => {
				resolve(results);
			});
		}
	});
}

/**
 * Simply ensures that no restaurant is supplied twice before browser rendering.
 * @param data - The data that has been already queried
 */
exports.makeUnique = data => {
	let restaurantData = [];
	// In outer results loop
	for (let i = 0; i < data.length; i++) {
		// Each result for type
		for (let y = 0; y < data[i].length; y++) {
			let present = false;
			// Length of restaurantData
			for (let z = 0; z < restaurantData.length; z++) {
				let dataID = new String(data[i][y]._id);
				let restaurantID = new String(restaurantData[z]._id);
				if (dataID.valueOf() == restaurantID.valueOf()) {
					present = true;
				}
			}
			if (!present) restaurantData.push(data[i][y]);
		}
	}
	return restaurantData;
};
/** ========= End Supporting functions for getBySearch() ========= */

/**
 * Returns the 3 most recent restaurants added to the database.
 * These are shown on the homepage.
 */
exports.getRecent = () => {
	return new Promise((resolve, reject) => {
		Restaurant.find({})
			.sort("-createdAt")
			.limit(3)
			.then((results, err) => {
				resolve(results);
			});
	});
};

/**
 * Returns the 3 top rated restaurants in the database.
 * These are shown on the homepage.
 */
exports.getPopular = () => {
	return new Promise((resolve, reject) => {
		Restaurant.find({})
			.sort("-rating")
			.limit(3)
			.then((results, err) => {
				resolve(results);
			});
	});
};
