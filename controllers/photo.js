var Photo = require("../models/photo");
var userCont = require("../controllers/user");
var fs = require('fs');

/**
 * Insets a singular photo into the database.
 * @param req - Request from the server.
 * @param res - Response for the server
 */
exports.insert = (req, res) => {
	var userData = req.body;
	if (userData == null) {
		res.status(403).send("No data sent!");
	}
	try {
		var photo = new Photo({
			photoId: userData.photoId,
			restaurantId: userData.restaurantId,
			photo: userData.photo,
			official: userData.official,
			userId: userData.userId
		});
		console.log("received: " + photo);

		photo.save(function(err, results) {
			console.log(results._id);
			if (err) res.status(500).send("Invalid data!");

			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(photo));
		});
	} catch (e) {
		res.status(500).send("error " + e);
	}
};

/**
 * Delete the photo from the path and database
 * @param userData - The request user data.
 */
exports.delete = function (userData) {
	return new Promise(function (resolve, reject) {
		Photo.find({userId: userData.userId, restaurantId: userData.restaurantId}, 'photo', function (err,res) {
			if (res.length == 0)
				resolve(res);
        	else{
                var path = './public' + res[0].photo;
                fs.unlink(path ,function (r) {
                    Photo.remove({userId: userData.userId, restaurantId: userData.restaurantId}, function (err,result) {
                        if(err) reject(err);
                        resolve(result);
                    })
                });
			}
        });
	})
}

/**
 * Gets a singular photo from the database when given the ID.
 * @param id - ID of a photo entry.
 */
exports.getByID = id => {
	return new Promise((resolve, reject) => {
		Photo.findById(id, "photo").then((result, err) => {
			if (err) reject(err);
			resolve(result.photo);
		});
	});
};

/**
 * Gets all of the photos in the database.
 */
exports.getAllID = () => {
	return new Promise((resolve, reject) => {
		Photo.find({}, "_id").then((results, err) => {
			if (err) reject(err);
			var photos = [];
			for (var i = 0; i < results.length; i++) {
				var photo = {
					_id: results[i]._id
				};
				photos.push(photo);
			}
			resolve(photos);
		});
	});
};

/**
 * Get the current photos to display on the page
 * @param id - The restaurant id
 * @param currentNum - The current number of photo to display
 */
exports.getByRestaurantId = function(id, currentNum) {
	return new Promise(function(resolve, reject) {
		Photo.find({ restaurantId: id }, function(err, results) {
			if (err) reject(err);

			// Add firstName and lastName fields to the object
            results.forEach(function(obj) {
				obj.firstName = "";
				obj.lastName = "";
			});

            var ops =[];
            for(var i=0; i< results.length; i++){
                ops.push(userCont.getUserById(results[i].userId));
            }

            Promise.all(ops).then(function (user) {
                for(var i=0; i< results.length; i++) {
                	if(!results[i].official){
                        results[i].firstName = user[i][0].firstName;
                        results[i].lastName = user[i][0].lastName;
					}
                }
                resolve(results);
            });

		}).skip((currentNum*4)).limit(4).lean().exec()
	});
};

/**
 * Get the number of photos for the restaurant
 * @param id - The restaurant id
 */
exports.getPhotoNumber = function (id) {
    return new Promise(function (resolve,reject) {
        Photo.count({restaurantId: id}, function (err,result) {
            if(err) reject(err);
            resolve(result);
        })
    })
};

/**
 * Get the icon photo for the restaurant to display in search
 * @param id - The restaurant id
 */
exports.getRestaurantIconById = function(id) {
	return new Promise(function(resolve, reject) {
		Photo.find({ restaurantId: id, icon: true }, function(err, results) {
			if (err) reject(err);
			resolve(results);
		});
	});
};
