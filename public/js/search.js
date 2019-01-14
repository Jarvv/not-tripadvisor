$(document).ready(() => {
	/**
	 * Showing the Dynamic Search results.
	 */
	$("#navSearchText").focus(function() {
		$(".searchResults ul").empty();
		$(".searchResults").show();
	});
	$("#navSearchText").focusout(function() {
		if (!$(".searchResults").is(":hover")) {
			$(".searchResults").hide();
		}
	});

	/*
	 * Sending the Ajax query after a short timeout after keystrokes.
	 */
	var timer = 0;
	$("#navSearchText").keyup(function() {
		clearTimeout(timer);

		timer = setTimeout(function() {
			var contents = JSON.stringify(
				serialiseForm("#navRestaurantSearch")
			);

			$.ajax({
				url: "/search",
				data: contents,
				contentType: "application/json",
				type: "PATCH",
				success: function(data) {
					populateRestaurantsNav(data.restaurants);
				},
				error: function(error) {
					console.log(error);
				}
			});
		}, 50);
	});

	/**
	 * Called when dynamic search ajax request is returned.
	 * Populates the html to show the results.
	 * @param restaurants List of results from Ajax results
	 */
	function populateRestaurantsNav(restaurants) {
		$(".searchResults ul").empty();
		for (var i = 0; i < restaurants.length; i++) {
			var html = "<a href='/restaurant/" + restaurants[i].id + "'><li>";
			html += restaurants[i].name;
			html +=
				"<span class='small-text'>" +
				restaurants[i].distance +
				" miles";
			html += "<i class='fas fa-circle'></i>";
			html += "<div>" + restaurants[i].typeOfCuisine + "</div>";
			html += "</span>";
			html += "<i class='fas fa-chevron-right'></i></li></a>";
			$(".searchResults ul").append(html);
		}
	}

	/**
	 * Gets all of the field values in a given form.
	 * @param  formID ID or class of the form in question.
	 */
	function serialiseForm(formID) {
		var formArray = $(formID).serializeArray();
		var data = {};
		for (index in formArray) {
			data[formArray[index].name] = formArray[index].value;
		}
		return data;
	}

	/**
	 * When noticing a change in the filtering form, emit the contents via socket.io
	 */
	$("#filter-form :input").change(() => {
		var contents = [serialiseForm("#filter-form")];
		var JSONPos = getCookie("userLoc");
		if (JSONPos != undefined)
			contents.push(JSON.parse(getCookie("userLoc")));
		else if (userLocationGlobal.length > 1)
			contents.push({
				lat: userLocationGlobal[0],
				lng: userLocationGlobal[1]
			});
		else contents.push("unset");
		contents.push($(".search-token span").text());
		contents.push(currentPage);
		emitFilter(JSON.stringify(contents));
	});

	/**
	 * Removes the search token from the filtering bar.
	 * Called when the user presses the little cross.
	 * If no user location, just reload the page.
	 */
	removeSearchToken = () => {
		if (userLocationGlobal != undefined && userLocationGlobal.length > 1) {
			window.location = "/search";
		} else {
			$(".search-token").remove();
			$(".searchTokenBR").remove();
			var contents = [serialiseForm("#filter-form")];
			var JSONPos = getCookie("userLoc");
			if (JSONPos != undefined)
				contents.push(JSON.parse(getCookie("userLoc")));
			else contents.push("unset");
			contents.push("");
			contents.push(currentPage);
			emitFilter(JSON.stringify(contents));
		}
	};

	/**
	 * Handler for pagination.
	 * Simply gets all filter data and acts like we're just filtering, but really we're asking for the next page.
	 * @param newPage - The page that we will be going to.
	 */
	pagClick = newPage => {
		var contents = [serialiseForm("#filter-form")];
		var JSONPos = getCookie("userLoc");
		if (JSONPos != undefined)
			contents.push(JSON.parse(getCookie("userLoc")));
		else if (userLocationGlobal.length > 1)
			contents.push({
				lat: userLocationGlobal[0],
				lng: userLocationGlobal[1]
			});
		else contents.push("unset");
		contents.push($(".search-token span").text());
		contents.push(newPage);
		emitFilter(JSON.stringify(contents));
	};

	/**
	 * Set up the two sliders in filtering
	 * #slider-radius is the distance slider.
	 * #slider-time is the fancy time selector.
	 */
	$("#slider-radius").slider();
	$("#slider-time").slider();
	$("#slider-radius").on("change", slideEvnt => {
		$("#sliderValue").html(slideEvnt.value.newValue + " miles");
	});
	$("#slider-time").on("change", slideEvnt => {
		var open = String(slideEvnt.value.newValue[0]);
		var close = String(slideEvnt.value.newValue[1]);
		$(".sliderTimeVal").html(formatTime(open) + " - " + formatTime(close));
	});

	/**
	 * Organise the time from #slider-time to be how the database understands.
	 */
	formatTime = time => {
		if (time.length == 3) {
			time = "0" + time;
		} else if (time.length == 1) {
			time = "000" + time;
		}
		time = time.split("");
		return time[0] + time[1] + ":" + time[2] + time[3];
	};

	/**
	 * Invert chevron on mobile filtering.
	 */
	$(".filter-dropdown").on("click", () => {
		console.log("click");
		$(".chevron-change").toggleClass("fa-chevron-down");
		$(".chevron-change").toggleClass("fa-chevron-up");
	});
});

/**
 * When socket.io returns the results from filtering, this is called.
 * Simply populates the Results section of HTML with the results.
 * @param restaurants - List of restaurants gotten from socket.io response.
 */
function populateRestaurantsResults(result) {
	let restaurants = result[0];
	$(".search-results").empty();
	let html = "";

	if (restaurants.length == 0) {
		html +=
			"<div class='no-results'>Sorry, filtering returned no results. Please try to alter your options to see restaurants.</div>";
	}

	for (var i = 0; i < restaurants.length; i++) {
		html += "<div class='result row'>";
		html += "<div class='col-md-3'>";
		html += "<div>";
		html +=
			"<img class='result-image' src='" + restaurants[i].photo + "'/>";
		html += "</div></div>";
		html += "<div class='col-md-9'>";
		html += "<div class='result-header'>";
		html +=
			"<h5 class='card-title restaurant-name'>" +
			restaurants[i].name +
			"</h5>";
		html += "</div>";
		html += "<div class='result-stars'>";
		var j = restaurants[i].rating;
		while (j >= 1) {
			html += "<i class='fas fa-star'></i>";
			j -= 1;
		}

		if (j > 0) {
			html += "<i class='fas fa-star-half'></i>";
		}
		html += " " + restaurants[i].ratingTotal + " reviews</div>";

		html +=
			"<div class='result-buttons btn-group' role='group' aria-label='Navigation'><button type='button' class='btn btn-secondary' onclick='setCenter( [ +" +
			restaurants[i].loc +
			"])'>View on Map</button><button type='button' class='btn btn-secondary'><a href='/restaurant/" +
			restaurants[i].id +
			"'>View Page <i class='fas fa-chevron-right'></i></a></button></div>";
		if (restaurants[i].distance != "") {
			html +=
				"<div class='result-loc-cuis'><span class='small-text'><span>" +
				restaurants[i].distance +
				" miles</span> | <span>" +
				restaurants[i].typeOfCuisine +
				"</span> | <span> ";

			for (let j = 0; j < restaurants[i].priceLevel; j++) {
				html += "<i class='fas fa-pound-sign'></i> ";
			}

			html += "</span> | <span> Reservations? ";
			if (restaurants[i].acceptReservations) {
				html += "<i class='fas fa-check'></i>";
			} else {
				html += "<i class='fas fa-times'></i>";
			}
			html += "</span> | <span>";
			for (let j = 0; j < restaurants[i].mealType.length; j++) {
				html += "<span>" + restaurants[i].mealType[j] + "</span> ";
			}

			html += "</span></span></div>";
		} else {
			html +=
				"<div class='result-loc-cuis'><span class='small-text'><span>" +
				restaurants[i].typeOfCuisine +
				"</span> | <span> ";
			for (let j = 0; j < restaurants[i].priceLevel; j++) {
				html += "<i class='fas fa-pound-sign'></i> ";
			}

			html += "</span> | <span> Reservations? ";
			if (restaurants[i].acceptReservations) {
				html += "<i class='fas fa-check'></i>";
			} else {
				html += "<i class='fas fa-times'></i>";
			}
			html += "</span> | <span>";
			for (let j = 0; j < restaurants[i].mealType.length; j++) {
				html += "<span>" + restaurants[i].mealType[j] + "</span> ";
			}
			html += "</span></span></div>";
		}
		html += "</div></div>";
	}

	$(".search-results").html(html);

	populatePagination(result[1], result[2]);
}

/**
 * Populates the pagination div, lists the number of pages and highlights the current page.
 * @param currentPage
 * @param totalPages
 */
function populatePagination(currentPage, totalPages) {
	$(".pagination").empty();
	let pagHTML = "";

	if (currentPage == 1) {
		pagHTML += "<li class='page-item disabled'>";
	} else {
		pagHTML += "<li class='page-item'>";
	}
	pagHTML +=
		"<a class='page-link' onclick='pagClick(" +
		(currentPage - 1) +
		")' aria-label='Previous'>";
	pagHTML +=
		"<i class='fa fa-chevron-left' aria-hidden='true'></i><span class='sr-only'>Previous</span></a></li>";

	for (let i = 1; i < totalPages + 1; i++) {
		if (i == currentPage) {
			pagHTML +=
				"<li class='page-item active'><a class='page-link' onclick='pagClick(" +
				i +
				")'>" +
				i +
				"</a></li>";
		} else {
			pagHTML +=
				"<li class='page-item'><a class='page-link' onclick='pagClick(" +
				i +
				")'>" +
				i +
				"</a></li>";
		}
	}

	if (currentPage == totalPages) {
		pagHTML += "<li class='page-item disabled'>";
	} else {
		pagHTML += "<li class='page-item'>";
	}
	pagHTML +=
		"<a class='page-link' onclick='pagClick(" +
		(currentPage + 1) +
		")' aria-label='Previous'>";
	pagHTML +=
		"<i class='fa fa-chevron-right' aria-hidden='true'></i><span class='sr-only'>Next</span></a></li>";

	$(".pagination").html(pagHTML);
}
