/**
 * Seed file for Not-TripAdvisor.
 * Simply seeds the database for example usage.
 */

var Restaurant = require("../models/restaurant");
var Photo = require("../models/photo");
var Review = require("../models/review");
var User = require("../models/user");
var Cuisine = require("../models/cuisine_type");
var Cities = require("../models/cities");

var cuisineCont = require("../controllers/cuisine_type");
var photoCont = require("../controllers/photo");
var userCont = require("../controllers/user");
var restCont = require("../controllers/restaurant");

function makeRestData(cuisines) {
	// id in order the same as they were entered
	var restaurantData = [{
			restaurantId: "1",
			name: "Bar One",
			typeOfCuisine: [cuisines[0]._id],
			address: "Sheffield Students Union, Glossop Rd",
			city: "Sheffield",
			postcode: "S10 2TG",
			location: {
				type: "Point",
				coordinates: [53.380427, -1.487142]
			},
			website: "su.sheffield.ac.uk",
			phone: "0114 222 8500",
			rating: 3,
			createdAt: new Date(),
			mealType: ["dinner", "lunch"],
			priceLevel: 2,
			acceptReservations: false,
			paymentAccepted: ["card", "cash"],
			openingTime: "09:00",
			closingTime: "23:00"
		},
		{
			restaurantId: "2",
			name: "Balti King",
			typeOfCuisine: [cuisines[1]._id],
			address: "216 Fulwood Rd",
			city: "Sheffield",
			postcode: "S10 3BB",
			location: {
				type: "Point",
				coordinates: [53.377595, -1.501256]
			},
			website: "baltiking-indian.co.uk",
			phone: "0114 266 6655",
			rating: 0,
			createdAt: new Date(),
			mealType: ["dinner"],
			priceLevel: 1,
			acceptReservations: true,
			paymentAccepted: ["card", "cash"],
			openingTime: "17:00",
			closingTime: "23:00"
		},
		{
			restaurantId: "3",
			name: "Sun Yee Crookes",
			typeOfCuisine: [cuisines[2]._id],
			address: "174 Crookes",
			city: "Sheffield",
			postcode: "S10 1UH",
			location: {
				type: "Point",
				coordinates: [53.384594, -1.507965]
			},
			phone: "0114 268 4336",
			rating: 0,
			createdAt: new Date(),
			mealType: ["dinner"],
			priceLevel: 3,
			acceptReservations: false,
			paymentAccepted: ["cash"],
			openingTime: "17:00",
			closingTime: "23:00"
		},
		{
			restaurantId: "4",
			name: "Pizza Express",
			typeOfCuisine: [cuisines[3]._id],
			address: "Unit 3, 483 Ecclesall Road",
			city: "Sheffield",
			postcode: "S11 8PR",
			location: {
				type: "Point",
				coordinates: [53.369097, -1.495404]
			},
			website: "pizzaexpress.com",
			phone: "0114 267 6626",
			rating: 0,
			createdAt: new Date(),
			mealType: ["lunch", "dinner"],
			priceLevel: 4,
			acceptReservations: true,
			paymentAccepted: ["cash", "card"],
			openingTime: "12:00",
			closingTime: "20:00"
		},
		{
			restaurantId: "5",
			name: "The Street Food Chef",
			typeOfCuisine: [cuisines[4]._id],
			address: "98 Pinstone St",
			city: "Sheffield",
			postcode: "S1 2HQ",
			location: {
				type: "Point",
				coordinates: [53.378622, -1.471362]
			},
			website: "streetfoodchef.co.uk ",
			phone: "0114 273 7909",
			rating: 0,
			createdAt: new Date(),
			mealType: ["dinner", "lunch"],
			priceLevel: 2,
			acceptReservations: false,
			paymentAccepted: ["cash"],
			openingTime: "13:00",
			closingTime: "23:00"
		},
		{
			restaurantId: "6",
			name: "La Tasca",
			typeOfCuisine: [cuisines[7]._id],
			address: "Meadowhall Centre",
			city: "Sheffield",
			postcode: "S9 1EP",
			location: {
				type: "Point",
				coordinates: [53.414258, -1.411175]
			},
			website: "www.latasca.co.uk ",
			phone: "0114 256 9986",
			rating: 3,
			createdAt: new Date(),
			mealType: ["dinner", "lunch"],
			priceLevel: 3,
			acceptReservations: true,
			paymentAccepted: ["cash", "card", "online"],
			openingTime: "10:00",
			closingTime: "23:00"
		},
		{
			restaurantId: "7",
			name: "Cafe Rouge",
			typeOfCuisine: [cuisines[6]._id],
			address: "52 Lower Petergate",
			city: "York",
			postcode: "YO1 7HZ",
			location: {
				type: "Point",
				coordinates: [53.961303, -1.081480]
			},
			website: "www.caferouge.com",
			phone: "01904 673293",
			rating: 5,
			createdAt: new Date(),
			mealType: ["breakfast", "dinner", "lunch"],
			priceLevel: 4,
			acceptReservations: true,
			paymentAccepted: ["cash", "card"],
			openingTime: "09:00",
			closingTime: "23:00"

		}
	];
	return restaurantData;
}

var cuisineData = [{
		name: "Pub"
	},
	{
		name: "Indian"
	},
	{
		name: "Chinese"
	},
	{
		name: "Pizza"
	},
	{
		name: "Mexican"
	},
	{
		name: 'Cafe'
	},
	{
		name: 'Gelato'
	},
	{
		name: 'Mediterranean'
	}
];

function makePhotoData(restaurants, users) {
	var photoData = [{
			photo: "/images/official-2.jpg",
			restaurantId: restaurants[1]._id,
			icon: true,
			official: true
		},
		{
			photo: "/images/official-3.jpg",
			restaurantId: restaurants[2]._id,
			icon: true,
			official: true
		},
		{
			photo: "/images/official-4.jpg",
			restaurantId: restaurants[3]._id,
			icon: true,
			official: true
		},
		{
			photo: "/images/official-5.jpg",
			restaurantId: restaurants[4]._id,
			icon: true,
			official: true
		},
		{
			photo: "/images/official-6.jpg",
			restaurantId: restaurants[5]._id,
			icon: true,
			official: true
		},
		{
			photo: "/images/official-7.jpg",
			restaurantId: restaurants[6]._id,
			icon: true,
			official: true
		},
		{
			photo: "/images/official-1.jpg",
			restaurantId: restaurants[0]._id,
			icon: true,
			official: true
		},
		{
			photo: "/images/official-2.jpg",
			restaurantId: restaurants[0]._id,
			icon: false,
			official: false,
			userId: users[0]._id
		},
		{
			photo: "/images/official-3.jpg",
			restaurantId: restaurants[0]._id,
			icon: false,
			official: false,
			userId: users[1]._id
		},
		{
			photo: "/images/official-4.jpg",
			restaurantId: restaurants[0]._id,
			icon: false,
			official: false,
			userId: users[1]._id
		},
		// for testing purposes
		{
			photo: "/images/official-5.jpg",
			restaurantId: restaurants[0]._id,
			icon: false,
			official: false,
			userId: users[2]._id
		}
	];

	return photoData;
}

function makeReviewData(restaurants) {
	var reviewData = [
		// {
		// 	reviewId: "1",
		// 	restaurantId: restaurants[0]._id,
		// 	userId: "1",
		// 	date: Date(),
		// 	rating: 5,
		// 	review: "This is a review.",
		// 	title: "Good restaurant"
		// },
		// {
		// 	reviewId: "2",
		// 	restaurantId: restaurants[0]._id,
		// 	userId: "2",
		// 	date: Date(),
		// 	rating: 1,
		// 	review: "This is another review.",
		// 	title: "Terrible Restaurant"
		// }
	];
	return reviewData;
}

function makeCitiesData() {
	return [{
			name: "Sheffield",
			location: {
				type: "Point",
				coordinates: [53.383, -1.465]
			}
		},
		{
			name: "York",
			location: {
				type: "Point",
				coordinates: [53.378622, -1.471362]
			}
		}
	];
}

var userData = [{
		firstName: "John",
		lastName: "Doe",
		email: "test@email.com",
		pass: "password"
	},
	{
		firstName: "Alice",
		lastName: "Foo",
		email: "email@email.com",
		pass: "password"
	},
	{
		firstName: "Bob",
		lastName: "Bar",
		email: "another@email.com",
		pass: "password"
	}
];

exports.seedRestaurants = function () {
	return new Promise(function (resolve, reject) {
		var ops = [];
		ops.push(cuisineCont.getAllID());
		Promise.all(ops).then(function (result) {
			Restaurant.create(makeRestData(result[0]), function (err, results) {
				if (err) reject(err);
				resolve("seeded restaurants");
			});
		});
	});
};

exports.seedCuisines = function () {
	return new Promise(function (resolve, reject) {
		Cuisine.create(cuisineData, function (err, results) {
			if (err) reject(err);
			resolve("seeded cuisines");
		});
	});
};

exports.seedPhotos = function () {
	return new Promise(function (resolve, reject) {
		var ops = [];
		ops.push(restCont.getAllID());
		ops.push(userCont.getAllID());
		Promise.all(ops).then(function (results) {
			Photo.create(makePhotoData(results[0], results[1]), function (
				err,
				results
			) {
				if (err) reject(err);
				resolve("seeded photos");
			});
		});
	});
};

exports.seedReviews = function () {
	return new Promise(function (resolve, reject) {
		var ops = [];
		ops.push(restCont.getAllID());
		Promise.all(ops).then(function (results) {
			Review.create(makeReviewData(results[0]), function (err, results) {
				if (err) reject(err);
				resolve("seeded reviews");
			});
		});
	});
};

exports.seedUsers = function () {
	return new Promise(function (resolve, reject) {
		User.create(userData, function (err, results) {
			if (err) reject(err);
			resolve("seeded users");
		});
	});
};

exports.seedCities = function () {
	return new Promise(function (resolve, reject) {
		Cities.create(makeCitiesData()).then((results, err) => {
			if (err) reject(err);
			resolve("seeded cities");
		});
	});
};