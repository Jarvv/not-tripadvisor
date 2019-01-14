/**
 * Defines the Review Schema for the database.
 */
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var Review = new Schema({
	//reviewId: { type: String, required: true },
	restaurantId: { type: String, require: true },
	userId: { type: String, required: true },
	date: { type: Date, required: true },
	rating: { type: Number, required: true },
	review: { type: String },
	title: {type: String}
});

Review.set("toObject", { getters: true });

var reviewModel = mongoose.model("Review", Review);

module.exports = reviewModel;
