module.exports = function(io) {
    io.on("connection", function (socket) {

        socket.on("filterReview", function (msg) {
            var review = require("./controllers/review-filter");

            review.getReviews(msg).then(function (result) {
                socket.emit("filterReviewReturned",result);
            });
        });
    });
};