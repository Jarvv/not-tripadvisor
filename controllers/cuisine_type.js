var CuisineType = require("../models/cuisine_type");

/**
 * Inserts a Cuisine Type into the database.
 * @param req - Request given by the server.
 * @param res - Response for the server.
 */
exports.insert = function(req, res) {
	var userData = req.body;
	console.log(userData);
	if (userData == null || JSON.stringify(userData) === "{}") {
		res.status(403).send("No data sent!");
		return false;
	}
	try {
		var cuisine = new CuisineType({
			name: userData.name
		});
		console.log("received: " + cuisine);

		cuisine.save(function(err, results) {
			if (err) throw err;
			console.log(results._id);
			if (err) res.status(500).send("Invalid data!");

			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(cuisine));
		});
	} catch (e) {
		res.status(500).send("error " + e);
	}
};

/**
 * Returns all of the cuisines in the database.
 */
exports.getAll = () => {
	return new Promise((resolve, reject) => {
		CuisineType.find({}, "name").then((results, err) => {
			if (err) reject(err);
			var cuisines = [];
			for (var i = 0; i < results.length; i++) {
				cuisines.push(results[i].name);
			}
			resolve(cuisines);
		});
	});
};

/**
 * Returns all cuisines in the database with their ID.
 */
exports.getAllID = () => {
	return new Promise((resolve, reject) => {
		CuisineType.find({}, "name _id").then((results, err) => {
			if (err) reject(err);
			var cuisines = [];
			for (var i = 0; i < results.length; i++) {
				var cuisine = {
					name: results[i].name,
					_id: results[i]._id
				};

				cuisines.push(cuisine);
			}
			resolve(cuisines);
		});
	});
};

/**
 * Gets a singular cuisine from the database when given the ID.
 * @param id - The ID of the cuisine.
 */
exports.getByID = id => {
	return new Promise((resolve, reject) => {
		CuisineType.find({ _id: id }, "name").then((result, err) => {
			if (err) reject(err);
			resolve(result[0].name);
		});
	});
};

/**
 * Gets the ID of a cuisine when given a name.
 * @param name - The name of the cuisine.
 */
exports.getID = (name, dynamic = false) => {
	return new Promise((resolve, reject) => {
		let mapped = [name].map(w => {
			return new RegExp(w, "i");
		});
		CuisineType.find({ name: { $in: mapped } }, "_id").then(
			(result, err) => {
				if (err) reject(err);
				if (!dynamic) resolve(result[0]._id);
				else resolve(result);
			}
		);
	});
};
