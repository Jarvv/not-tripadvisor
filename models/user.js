/**
 * Defines the User Schema for the database.
 */
var mongoose = require("mongoose");
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

/*
 * User Schema.
 * Includes first name, last name, email and a hashed password with bcrypt.
 */
var User = new Schema({
	userId: { type: String},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    pass: { type: String, required: true }
});

User.set("toObject", { getters: true });

/*
 * Pre function used to hash passwords before they are added to the database.
 * Called whenever a new user is created (saved)
 */
User.pre('save', function(next) {
	var user = this;
	bcrypt.hash(user.pass, 10, function(err, hash) {
		if (err) {
			return next(err);
		}
		user.pass = hash;
		next();
	});
});

var userModel = mongoose.model("User", User);

module.exports = userModel;
