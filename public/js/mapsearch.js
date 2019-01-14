// Global Variables
var map, infoWindow, bounds, position, directionsService, directionsDisplay;
var markers = [];

$(document).ready(function() {
	// If map element is present within the page, initialise it
	if ($("#map").length > 0) {
		var api = document.createElement("script");
		api.type = "text/javascript";
		api.src =
			"https://maps.googleapis.com/maps/api/js?key=AIzaSyBACZmM2ST5TuddcJ6ug5nUfz3DBoYyDhk&callback=initMap&libraries=places,geometry";
		document.getElementsByTagName("head")[0].appendChild(api);
	}

	//Set the user location
	if (window.location.pathname == "/") {
		getLocation(function(position) {
			document.cookie = "userLoc=" + JSON.stringify(position);
		});
	}
});

/**
 * Initialise the map, center the map on the users position and retrieve any markers.
 */
function initMap() {
	infoWindow = new google.maps.InfoWindow();
	directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer();

	var JSONPos = getCookie("userLoc");
	if (JSONPos != undefined) {
		var position = JSON.parse(getCookie("userLoc"));
		var userLoc = new google.maps.LatLng(position.lat, position.lng);

		// Load the map centered on the users location
		map = new google.maps.Map(document.getElementById("map"), {
			center: userLoc,
			zoom: 15
		});

		marker = new google.maps.Marker({
			map: map,
			draggable: true,
			animation: google.maps.Animation.DROP,
			position: userLoc,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 4
			}
		});
		marker.setAnimation(google.maps.Animation.BOUNCE);
	} else {
		if (userLocationGlobal.length != 1) {
			var userLoc = new google.maps.LatLng(
				userLocationGlobal[0],
				userLocationGlobal[1]
			);
			var zoom = 10;
		} else {
			var userLoc = new google.maps.LatLng(52.561928, -1.464854);
			var zoom = 6;
		}

		// Load the map centered on the users location
		map = new google.maps.Map(document.getElementById("map"), {
			center: userLoc,
			zoom: zoom
		});
	}

    bounds = new google.maps.LatLngBounds(userLoc);
	map.setCenter(userLoc, false);
	directionsDisplay.setMap(map);

	// Get Restaurant markers
	getRestaurantMarkers();
}

function getDirections(restaurantLocation) {
	var position = JSON.parse(getCookie("userLoc"));
	window.location.href =
		"https://www.google.com/maps/dir/?api=1&origin=" +
		position.lat +
		"," +
		position.lng +
		"&destination=" +
		restaurantLocation.coordinates[0] +
		"," +
		restaurantLocation.coordinates[1];
}

/**
 * Converts the JSON of results into markers on the map
 * @param results -
 */
var plotMarkers = function(results) {
	// Clear current markers
	clearMarkers();

	// Create an InfoWindow for the markers containing the restaurant content
	var restaurantInfo = new google.maps.InfoWindow({});
	for (var i = 0; i < results.length; i++) {
		createMarker(results[i],bounds);
	}
    map.fitBounds(bounds);

	// Places a marker on the map
	function createMarker(place,bounds) {
		// Create a marker to place on the map at the specified location and push to marker array
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(place.lat, place.lng),
			map: map
		});

        bounds.extend(marker.position);
		markers.push(marker);
		// Contains the restaurant name and a link to the restaurant page
		var info =
			"<h5>" +
			place.name +
			"</h5><p><b>Address:</b> " +
			place.address +
			", <br>" +
			place.city +
			", " +
			place.postcode +
			"<br><b>Phone:</b> " +
			place.phone +
			"</p><button class='btn btn-secondary'><a href=/restaurant/" +
			place.id +
			"> View Restaurant </a></button>";

		// Allow the user to click on the marker, revealing the restaurant info
		google.maps.event.addListener(marker, "click", function() {
			restaurantInfo.setContent(info);
			restaurantInfo.open(map, this);
		});
	}

	function clearMarkers() {
		// Remove each of the current markers on the map
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		// Removes all references to the markers
		markers = [];
	}
};

/* HTML functions */
/**
 * Update the visual value of the radius slider, called when slider is moved.
 * @param value - The new value of the slider
 */
function updateSlider(value) {
	document.getElementById("sliderValue").innerText = value + " miles";
}

/* Global Functions */
/**
 * Gets the list of restaurants currently displayed in search results, perform an Ajax request using the name of the
 * restaurants to return data for their markers.
 */
function getRestaurantMarkers() {
	// Get the restaurants currently listed on the page.
	var restaurants = document.getElementsByClassName("restaurant-name");

	var restaurantsList = [];
	for (var i = 0; i < restaurants.length; i++) {
		var restaurant = restaurants[i].innerHTML;
		restaurantsList.push(restaurant);
	}

	//Search restaurants and plot markers
	$.ajax({
		type: "PATCH",
		data: JSON.stringify(restaurantsList),
		url: "/search/markers",
		contentType: "application/json",
		dataType: "json"
	}).done(function(response) {
		plotMarkers(response[0]);
	});
}

/**
 * Center the map on the coordinates.
 * @param coords - coordinates of the chosen restaurant
 */
function setCenter(coords, jump = true) {
	var center = new google.maps.LatLng(coords[0], coords[1]);
	map.setCenter(center);

	if (jump) $(document).scrollTop(0);
}

/**
 * Get the location of the user.
 * @param result - Callback the resultant coordinates.
 */
function getLocation(result) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(data, err) {
			if (err) throw err;

			// Get the position of the user
			var position = {
				lat: data.coords.latitude,
				lng: data.coords.longitude
			};

			result.call(null, position);
		});
	}
}

function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length === 2) return parts.pop().split(";").shift();
}
