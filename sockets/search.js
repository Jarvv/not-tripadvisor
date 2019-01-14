module.exports = function(io) {
	io.on("connection", function(socket) {
		// When socket.io catches filtering emit, simply get the results and return to browser.
		socket.on("filterData", function(msg) {
			var search = require("./controllers/socket-filter");
			search.getRestaurants(msg).then((result, err) => {
				socket.emit("filterDataReturned", result);
			});
		});
	});
};
