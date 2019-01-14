var socket = io();
/**
 * Emit a filter for the photos, getting the next batch of photos
 * @param data - data from filter
 */
function emitPhotoFilter(data) {
    socket.emit("filterPhoto", data);

    socket.on("filterPhotoReturned", function(results) {
        populatePhotoResults(results);
        if(slideIndex === 4){
            currentSlide(0);
        }else if(slideIndex === -1){
            currentSlide(3);
        }
    });
}
