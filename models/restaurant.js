/**
 * Defines the Restaurant Schema for the database.
 */

var mongoose = require("mongoose");
mongoose.set("debug", true);

var Schema = mongoose.Schema;

// 

var Restaurant = new Schema({
	name: { type: String, required: true, max: 100 },
	typeOfCuisine: { type: [String] },
	address: { type: String },
	city: { type: String },
	postcode: { type: String },
	location: {
		type: {
			type: String,
			default: "Point"
		},
		coordinates: {
			type: [Number]
		}
	},
	website: { type: String },
	phone: { type: String },
	photos: { type: [String] },
	rating: { type: Number },
	createdAt: { type: Date },
	mealType: {type: [String]},
	priceLevel: {type: Number},
	acceptReservations: {type: Boolean},
	paymentAccepted: {type: [String]},
	openingTime: {type: String},
	closingTime: {type: String},
	userId: {type: String}
});

Restaurant.set("toObject", { getters: true });
Restaurant.index({ location: "2dsphere" });
var restaurantModel = mongoose.model("Restaurant", Restaurant);

module.exports = restaurantModel;
