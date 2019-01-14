var User = require("../models/user");
var bcrypt = require('bcrypt');

/**
 * Insert a new user into the database.
 * @param req - Request to the server. Contains the form data for the new user.
 * @param res - Result to send back to the client. 
 */
exports.insert = function(req, res) {
	var userData = req.body;

	if (userData == null) {
		res.status(403).send("No data sent!");
	}
	try {
		var user = new User({
			userId: 1,
			firstName: userData.firstName,
			lastName: userData.lastName,
			email: userData.email,
			pass: userData.pass
		});

		user.save(function(err, results) {
			if (err) res.status(500).send("Invalid data!");
			res.redirect('/')
		});

	} catch (e) {
		res.status(500).send("error " + e);
	}
};

exports.getUserById = function (id) {
	return new Promise(function (resolve,reject) {
        User.find({_id: id}, 'firstName lastName').then(function (res,err) {
			if(err) reject(err);
			resolve(res);
        })
	});
};

/**
 * Authenicate the user at login. Check if they exist in the database and if the passwords match.
 * @param email - The email address used to sign in with.
 * @param password - The password sent from the login form.
 * @param callback - Callback function
 */
exports.authenticate = function(email, password, callback) {
	User.find({email: email}).exec(function(err, user) {
		console.log(err)
		console.log(user)
		if (err) {
			console.log(err);
			return callback(err)
		} else if (!user || user.length == 0) {
			var err = new Error('User not found.');
			err.status = 401;
			return callback(err);
		}
		bcrypt.compare(password, user[0].pass, function(err, result) {
			if (result == true) {
				return callback(null, user[0]._id);
			} else {
				var err = new Error('Passwords do not match');
				return callback(err);
			}
		});
	});
}

/**
 * Helper function to check session information
 */
exports.checkSession = function(req, res) {
	if (req.session) {
		console.log(req.session.userId);
		res.send(JSON.stringify(req.session.userId));
	} else {
		console.log('No Session')
		res.redirect('/')
	}
}

/**
 * Gets all of the users for seeding in the database.
 */
exports.getAllID = () => {
    return new Promise((resolve, reject) => {
        User.find({}, "_id").then((results, err) => {
			if (err) reject(err);
			var users = [];
			for (var i = 0; i < results.length; i++) {
				var user = {
					_id: results[i]._id
				};
				users.push(user);
			}
    		resolve(users);
		});
	});
};
