var review = require('../../controllers/review');

/**
 * When given the filtering info, return the relevant photos.
 * @param msg - Filtering data sent from browser via socket.io
 * @returns {*|Promise<any>} - The filtered reviews.
 */
exports.getReviews = function (msg) {
    return new Promise(function (resolve,reject) {
        var data = JSON.parse(msg);

        review.getByRestaurantId(data[0],data[1]).then(function (results) {
           resolve(results);
        });
    })
};