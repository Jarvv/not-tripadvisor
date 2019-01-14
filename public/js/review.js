var currentPage;

/**
 * Setup the pagination for the reviews.
 */
$(document).ready(function() {
    currentPage = 1;

    if($( ".page-item" ).length > 0){
        document.getElementsByClassName('page-item')[0].className = "page-item disabled";
        document.getElementsByClassName('page-item')[currentPage].className += " active";
    }
});

/**
 * When a pagination button is clicked, update the reviews shown on the restaurant page.
 * @param newPage - Whether going forward or backward in pagination, or a specific number is clicked.
 * @param restaurantId - The id of the restaurant
 * @param reviewNumber - The current review number of the pagination.
 */
function reviewButton(newPage, restaurantId, reviewNumber) {
    document.getElementsByClassName('page-item active')[0].className = "page-item";

    if(newPage === "next")
        currentPage += 1;
    else if(newPage === "prev")
        currentPage += -1;
    else
        currentPage = newPage;

    var contents = [restaurantId];
    contents.push(currentPage);
    emitReviewFilter(JSON.stringify(contents));

    // Update the pagination tabs
    document.getElementsByClassName('page-item')[currentPage].className += " active";
    if(currentPage === Math.ceil(reviewNumber / 5)){
        document.getElementsByClassName('page-item disabled')[0].className = "page-item";
        document.getElementsByClassName('page-item')[Math.ceil(reviewNumber / 5)+1].className = "page-item disabled";
    }else if(currentPage === 1){
        document.getElementsByClassName('page-item disabled')[0].className = "page-item";
        document.getElementsByClassName('page-item')[0].className = "page-item disabled";
    }
}

/**
 * When socket.io returns the results from filtering, this is called.
 * Simply populates the Results section of HTML with the results.
 * @param reviews - List of reviews received from socket.io response.
 */
function populateReviewResults(reviews) {
    $(".search-results").empty();
    var html = "";

    for (var i = 0; i < reviews.length; i++) {
        html += "<div class='result row'>";
        html += "<div class='row mx-4 my-4'>";
        html += "<div class='media'>";
        html += "<div class='media-body'>";
        html += "<h4 class='media-heading'>" + reviews[i].title + "</h4>";
        html += "<p class='text-right'>By "+ reviews[i].firstName + " " + reviews[i].lastName+ "</p>";
        html += "<p>" + reviews[i].review + "</p>";

        for(var j=0; j < reviews[i].rating; j++) {
            html += "<span class='fas fa-star'></span>"
        }

        html += "<small><i class='text-left'>Posted on " + reviews[i].date + "</i></small>";
        html += "</div></div></div></div>";

    }

    $(".search-results").html(html);
}
