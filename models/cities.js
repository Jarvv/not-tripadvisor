/**
 * Defines the Cities Schema for the database.
 */
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var Cities = new Schema({
	name: { type: String, required: true },
	location: {
		type: {
			type: String,
			default: "Point"
		},
		coordinates: {
			type: [Number]
		}
	}
});

Cities.set("toObject", { getters: true });
Cities.index({ location: "2dsphere" });
var citiesModel = mongoose.model("Cities", Cities);

module.exports = citiesModel;
