var socket = io();
/**
 * Simply emits the form elements to the server for filtering.
 * @param data - List of form elements when filtering occurs.
 */
function emitFilter(data) {
	socket.emit("filterData", data);

	socket.on("filterDataReturned", function(results, err) {
		populateRestaurantsResults(results);
		getRestaurantMarkers();
	});
}
