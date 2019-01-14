/**
 * The logic to seed the DB.
 * Firstly deletes all records, and then adds the pre-defined ones from /db/seed
 */

var mongoose = require("mongoose");
var Restaurant = require("../models/restaurant");
var Cuisine = require("../models/cuisine_type");
var Photo = require("../models/photo");
var Review = require("../models/review");
var User = require("../models/user");
var Cities = require("../models/cities");

var seed = require("../db/seed");

/**
 * Seeds the database by first wiping it, then plants the seeds.
 */
exports.init = function() {
	Restaurant.remove().then((r_result, r_err) => {
		console.log("Restaurants removed");
		Cuisine.remove().then((c_result, c_err) => {
			console.log("Cuisines removed");
			Photo.remove().then((p_result, p_err) => {
				console.log("Photos removed");
				Review.remove().then((r_result, r_err) => {
					console.log("Reviews removed");
					User.remove().then((u_result, u_err) => {
						console.log("Users removed");
						Cities.remove().then((c_result, c_err) => {
							console.log("Cities removed");
							seed.seedUsers().then((res, err) => {
								console.log(res);
								seed.seedCities().then((res, err) => {
									console.log(res);
									seed.seedCuisines().then((res, err) => {
										console.log(res);
										seed
											.seedRestaurants()
											.then((res, err) => {
												console.log(res);
												seed
													.seedReviews()
													.then((res, err) => {
														console.log(res);
														seed
															.seedPhotos()
															.then(
																(res, err) => {
																	console.log(
																		res
																	);
																}
															);
													});
											});
									});
								});
							});
						});
					});
				});
			});
		});
	});
};
