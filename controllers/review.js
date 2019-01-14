var Review = require("../models/review");
var photoCont = require("../controllers/photo");
var reviewCont = require("../controllers/review");
var userCont = require("../controllers/user");
var restaurant = require("../controllers/restaurant");

/**
 * Get the current reviews for a particular restaurant
 * @param id - The restaurant id
 * @param currentNum - The current review number
 */
exports.getByRestaurantId = function(id, currentNum) {
	return new Promise(function(resolve, reject) {
		Review.find({ restaurantId: id }, function(err, results) {
			if (err) reject(err);

			var ops =[];
			for(var i=0; i< results.length; i++){
			    ops.push(userCont.getUserById(results[i].userId));
            }
            Promise.all(ops).then(function (res) {
                for(var i=0; i< results.length; i++) {
                    results[i].firstName = res[i][0].firstName;
                    results[i].lastName = res[i][0].lastName;
                }
                resolve(results);
            });

		})
			.skip((currentNum - 1) * 5)
			.limit(5);
	});
};

/**
 * Get the number of reviews for the restaurant
 * @param id - The restaurant id
 */
exports.getReviewNumber = function(id) {
	return new Promise(function(resolve, reject) {
		Review.count({ restaurantId: id }, function(err, result) {
			if (err) reject(err);
			resolve(result);
		});
	});
};

/**
 *  If a user has already posted a review for the restaurant, retrieve its information
 * @param restaurantId - The id of the restaurant
 * @param userId - The id of the user
 */
exports.getUsersReview = function(restaurantId, userId) {
	return new Promise(function(resolve, reject) {
		Review.find({ restaurantId: restaurantId, userId: userId }, function(
			err,
			result
		) {
			if (err) reject(err);
			resolve(result);
		});
	});
};

/**
 * Update the review that the user has already posted.
 * @param userData - The request body data
 */
exports.update = function(userData) {
	return new Promise(function(resolve, reject) {
		// Get the difference of the ratings
	    var newRating = userData.rating - userData.oldRating;
	    // Update the restaurant rating
        reviewCont.updateRestaurantRating(userData.restaurantId, newRating, "update");
		Review.update(
			{ _id: userData.reviewId },
			{
				date: Date(),
				rating: userData.rating,
				review: userData.review,
				title: userData.title
			},
			function(err, result) {
				if (err) reject(err);
				resolve(result);
			}
		);
	});
};

/**
 * Delete the review of the user for the restaurant
 * @param userData - The request body data
 */
exports.delete = function (userData) {
    return new Promise(function (resolve) {
    	// Update the restaurant rating
        reviewCont.updateRestaurantRating(userData.restaurantId, userData.rating, "delete");
        Review.remove({_id: userData.reviewId}, function (err,result) {
            if(err) reject(err);

            // Delete the associated photos
            var ops = [];
            ops.push(photoCont.delete(userData));
            Promise.all(ops).then(function () {
                resolve(result);
			});
        })
    })
};

/**
 * Get the new rating value from the new rating and all previous reviews
 * @param id - The id of the restaurant
 * @param rating - The rating to update with
 * @param review - What type of update to perform
 */
exports.updateRestaurantRating = function(id, rating, review) {
	reviewCont.getAllForRestaurant(id).then(function(result) {
        var newRating = 0;
        var mean = result[0] * result[1];

        if(review === "new")
            newRating = (mean + parseInt(rating)) / (result[1] + 1);
        else if(review === "update")
            newRating = (mean + parseInt(rating)) / (result[1]);
        else if(review === "delete")
            if(result[1] -1 === 0)
                newRating = 0;
            else {
                newRating = (mean - parseInt(rating)) / (result[1] - 1);
            }
        newRating = Math.round(newRating * 2) / 2;

		// Update in the collection
        restaurant.updateRating(id, newRating);
    });
};

/**
 *  Get all of the reviews of the restaurant.
 */
exports.getAllForRestaurant = restaurantId => {
	return new Promise(function(resolve, reject) {
		Review.find({ restaurantId: restaurantId }).then((result, err) => {
			if (err) reject(err);
			let total = result.length;
			let rating = 0;
			for (i in result) rating += result[i].rating;
			if (rating != 0) rating = (rating / total).toFixed(2);
			resolve([rating, total]);
		});
	});
};
