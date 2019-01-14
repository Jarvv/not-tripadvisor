var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require("multer");

var reviewCont = require('../controllers/review');
var upload = multer({dest: 'public/images/'});
var Review = require("../models/review");
var Photo = require("../models/photo");

router.use(bodyParser.json({limit: '50mb'}));

/**
 * Insert a review into the database and upload any associated photos.
 */
router.post('/insert', upload.array('photos', 12), function (req,res,next) {
    var userData = req.body;
    console.log(userData);
    if (userData == null) {
        res.status(403).send("No data sent!");
    }
    try {
        reviewCont.updateRestaurantRating(userData.restaurantId, userData.rating, "new");

        var review = new Review({
            restaurantId: userData.restaurantId,
            userId: req.session.userId,
            date: Date(),
            rating: userData.rating,
            review: userData.review,
            title: userData.title
        });

        review.save(function(err, results) {
            if (err) res.status(500).send("Invalid data!");

            // If there is an associated photo, upload this too.
            if (userData.cameraImage.length > 1) {
                var date = new Date().getTime();
                var path = "public/images/";
                var fileName = userData.restaurantId + date;
                var image = userData.cameraImage.replace(/^data:image\/\w+;base64,/, "");
                var buf = new Buffer(image, 'base64');
                fs.writeFile(path + fileName + '.png', buf);

                path = "/images/" + fileName + '.png';
                Photo.create({
                    photo: path,
                    restaurantId: userData.restaurantId,
                    icon: false,
                    official: false,
                    userId: req.session.userId,
                    title: userData.title
                });
            }
            res.redirect("back");
        });
    } catch (e) {
        res.status(500).send("error " + e);
    }
});

/**
 * Delete the review.
 */
router.post('/delete', function (req,res) {
    var ops = [];
    ops.push(reviewCont.delete(req.body));

    Promise.all(ops).then(function (results) {
        res.redirect('back');
    })
});

/**
 * Update the review.
 */
router.post('/update', function (req,res) {
    var ops = [];
    ops.push(reviewCont.update(req.body));

    Promise.all(ops).then(function (results) {
        res.redirect('back');
    })
});

module.exports = router;