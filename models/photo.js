/**
 * Defines the Photo Schema for the database.
 */

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var Photo = new Schema({
	photoId: { type: String },
	restaurantId: { type: String },
	photo: { type: String },
	official: { type: Boolean },
	userId: { type: String },
	icon: {type: Boolean},
	title: {type: String}
});

Photo.set("toObject", { getters: true });

var photoModel = mongoose.model("Photo", Photo);

module.exports = photoModel;
