var slideIndex = 0;
var globalSlide = 0;
var photoLength = 0;
var page = 0;

/**
 * Initiate the photo carousel.
 */
$(document).ready(function() {
    var pic = document.getElementsByClassName("carousel-item");
    var indicator = document.getElementsByClassName("indicator-list");
    pic[0].className += " active";
    indicator[0].className += " active";
});

/**
 * Update the current slide if the thumbnail picture is clicked on.
 * @param n - The current slide number.
 */
function currentSlide(n) {
    var pic = document.getElementsByClassName("carousel-item");
    var indicator = document.getElementsByClassName("indicator-list");

    slideIndex = n;
    globalSlide = page+slideIndex;

    for (var i = 0; i < pic.length; i++) {
        pic[i].className = "carousel-item";
        indicator[i].className = "indicator-list";
    }

    pic[slideIndex].className += " active";
    indicator[slideIndex].className += " active";
}

/**
 * Update the current slide.
 * @param next - Go to next or previous slide
 * @param photoTotal - The total number of photos of the restaurant.
 * @param restaurantId - The id of the restaurant
 */
function plusSlide(next, photoTotal, restaurantId) {
    photoLength = photoTotal;

    if((globalSlide + next) >= 0 && (globalSlide + next) < parseInt(photoTotal)) {

        var newSlide = next + slideIndex;
        globalSlide += next;

        if (newSlide === 4 || newSlide < 0) {
            slideIndex = newSlide;
            page += next;
            var contents = [restaurantId];
            contents.push(Math.floor((globalSlide)/4));
            emitPhotoFilter(JSON.stringify(contents));
        }

        if (newSlide >= 0 && newSlide < 4) {
            slideIndex = newSlide;
        }
    }
}

/**
 * When socket.io returns the results from filtering, this is called.
 * Simply populates the Photos section of HTML with the results.
 * @param photos - List of photos received from socket.io response.
 */
function populatePhotoResults(photos) {
    $(".carousel-container").empty();
    var html = "";
    html += "<div id=\"carousel\" class=\"carousel\" data-interval=\"false\">";
    html += "<ol class=\"carousel-indicators\">";
    for(var i = 0; i < photos.length; i++) {
        html += "<li class=\"indicator-list\" data-target=\"#carousel\" data-slide-to=\"<%= i %>\"></li>";
    }

    html += "</ol>";
    html += "<div class=\"carousel-inner\">";
    for(var i = 0; i < photos.length; i++) {
        html += "<div class='carousel-item' style='background-image: url("+ photos[i].photo + " )'>";
        html += "<div class=\"carousel-caption d-none d-md-block\">";
        if(photos[i].official) {
            html += "<div class=\"slideNumber\"> Official: <i class=\"fa fa-check\"></i></div>";
        }else {
            html += "<div class=\"slideNumber\"> Photo by: " + photos[i].firstName + " " + photos[i].lastName + "</div>";
        }
        html += "</div></div>";
    }

    html += "</div>";
    html += '<a class=\"carousel-control-prev\" href=\"#carousel\" onclick="plusSlide(-1,' + photoLength + ', \''  + photos[0].restaurantId + '\')" role=\"button\" data-slide=\"prev\">';
    html += "<span class=\"carousel-control-prev-icon\" aria-hidden=\"true\"></span>";
    html += "<span class=\"sr-only\">Previous</span></a>";
    html += '<a class=\"carousel-control-next\" href=\"#carousel\" onclick="plusSlide(-1,' + photoLength + ', \''  + photos[0].restaurantId + '\')" role=\"button\" data-slide=\"next\">';
    html += "<span class=\"carousel-control-next-icon\" aria-hidden=\"true\"></span>";
    html += "<span class=\"sr-only\">Next</span>";
    html += "</a></div>";
    for(var i = 0; i < photos.length; i++) {
        html += "<div class=\"column\">";
        html += "<img class=\"img-thumbnail\" src='"+ photos[i].photo +"' onclick='currentSlide("+ i +")'></div>";
    }

    html += "</div>";

    $(".carousel-container").html(html);
}