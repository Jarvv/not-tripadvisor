var restaurantId = "";

if ("serviceWorker" in navigator) {
    // run this code at loading time
    window.addEventListener("load", function () {
        // register the service worker. the service worker is a js file
        // AND *must* be installed on the root of the set of pages it
        // controls. You can reload the pages as many times as you want
        // do not worry about registering a service worker multiple times
        navigator.serviceWorker.register("/service-worker.js").then(
            function (registration) {
                // Registration was successful
                console.log(
                    "ServiceWorker registration successful with scope:",
                    registration.scope
                );
            },
            function (err) {
                // registration failed :(
                console.log("ServiceWorker registration failed: ", err);
            }
        );
    });
}

/**
 * On clicking the submit button, create the form data.
 */
$(document).on('submit', '#reviewForm', function (e) {
    e.preventDefault();
    var formData = new FormData(this);
    postReview(formData);
});

/**
 * Get the data of the form as a JSON object to store in the localStorage
 * @returns String - The data to input in the localStorage
 */
function getReviewData() {
    var restaurantId = document.getElementById("restaurantId").value;
    var reviewTitle = document.getElementById("reviewTitle").value;
    var reviewRating = document.getElementById("reviewRating").value;
    var review = document.getElementById("review").value;
    var cameraFile = document.getElementById("cameraInput").value;

    var input = JSON.stringify({
        restaurantId: restaurantId,
        title: reviewTitle,
        rating: reviewRating,
        review: review,
        cameraImage: cameraFile
    });

    return input;
}

/**
 * Get the current users id from the database.
 * @param id - The users id.
 */
function getUserId(id) {
    $.ajax({
        url: '/user/checkSession',
        contentType: 'application/json',
        type: 'GET',
        success: function (result) {
            id(result);
        }
    })
}

/**
 * When now online, using the review data from the cache, upload the review to the database.
 */
function getReviewCache() {
    var input = getCachedData("review");
    if (input != null) {
        $.ajax({
            url: '/review/insert',
            data: input,
            type: 'POST',
            contentType: 'application/json',
            success: function () {
                $("#reviewDiv").empty();
                var html = "<h2>Reload to view your review!</h2>";
                $("#reviewDiv").html(html);
            }
        });
    }
}

/**
 * Using the FormData for the review, attempt to upload to the database, if offline then store in the cache.
 * @param input - The FormData of the review.
 */
function postReview(input) {
    $.ajax({
        url: '/review/insert',
        data: input,
        type: 'POST',
        success: function () {
            location.reload();
        },
        cache: false,
        contentType: false,
        processData: false,
        // the request to the server has failed. Cache the data
        error: function () {
            var cacheInput = getReviewData();
            storeCachedData("review", cacheInput);
            showOfflineWarning();

            const dvv = document.getElementById('offline_div');
            if (dvv != null)
                dvv.style.display = 'block';

            window.alert("You are offline. Your review will be posted when you come back online.");
            location.reload();
        }
    });
}

window.addEventListener('load', function (e) {
    if (navigator.onLine){
        hideOfflineWarning();
        getUserId(function (userId) {
            if(userId.length > 0) {
                getReviewCache();
            }
        });
    }
    else showOfflineWarning();
}, false);

function showOfflineWarning() {
    if (document.getElementById('offline_div') != null)
        document.getElementById('offline_div').style.display = 'block';
}

function hideOfflineWarning() {
    if (document.getElementById('offline_div') != null)
        document.getElementById('offline_div').style.display = 'none';
}