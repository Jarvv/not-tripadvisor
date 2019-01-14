module.exports = function(io) {
    io.on("connection", function (socket) {

        socket.on("filterPhoto", function (msg) {
            var photo = require("./controllers/photo-filter");

            photo.getPhotos(msg).then(function (result) {
                socket.emit("filterPhotoReturned",result);
            });
        });
    });
};