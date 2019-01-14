var Cities = require("../models/cities");

/**
 * Called when no user location available and the user wants to search by city.
 * @param search - Search term
 */
exports.getFromSearch = search => {
	return new Promise((resolve, reject) => {
		Cities.find({ name: { $regex: search, $options: "ix" } }).then(
			(res, err) => {
				if (err) reject(err);
				resolve(res);
			}
		);
	});
};
