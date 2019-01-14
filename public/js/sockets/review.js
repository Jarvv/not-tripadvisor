var socket = io();
/**
 * Emit a filter for the reviews, getting the next batch of reviews
 * @param data - data from filter
 */
function emitReviewFilter(data) {
    socket.emit("filterReview", data);

    socket.on("filterReviewReturned", function(results, err) {
        populateReviewResults(results);
    });
}
