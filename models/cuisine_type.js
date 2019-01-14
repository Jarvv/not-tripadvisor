/**
 * Defines the CuisineType Schema for the database.
 */
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CuisineType = new Schema({
	name: { type: String, required: true }
});

CuisineType.set("toObject", { getters: true });

var cuisineModel = mongoose.model("CuisineType", CuisineType);

module.exports = cuisineModel;
