
/*
 * Trigger for browse button to open file select on the users browser.
 */
$(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});


/*
 * Functions to control the camera and file select
 */
$(document).ready( function() {

	/*
	 * Update the readonly image section to use the name of the uploaded image.
	 */
    $(':file').on('fileselect', function(event, numFiles, label) {

	    var input = $(this).parents('.form-group .photos').find(':text'),
	        log = numFiles > 1 ? numFiles + ' files selected' : label;

	    if( input.length ) {
	        input.val(log);
	    } else {
	        if( log ) alert(log);
	    }

    });

    // Initialise variables for controlling the camera
    var streaming = false;
    var width = 320;
    var height = 0;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    var usingCameraImage = false;

    /*
     * When taking a new still shot, clear the stream and update the area displaying the still shot.
     */
    function clearPhoto() {
	    var context = canvas.getContext('2d');
	    context.fillStyle = "#AAA";
	    context.fillRect(0, 0, canvas.width, canvas.height);

	    var data = canvas.toDataURL('image/png');
	    photo.setAttribute('src', data);
	}


	/*
	 * Add image data to the form submit when using a camera image
	 */
	function useImageFunc() {
		document.getElementById("cameraFile").value = photo.src;
		document.getElementById("imagesPlaceholder").placeholder = "Images added: Camera Image";
		usingCameraImage = true;
	}

	// Initialise the video stream
    function beginCamera() {
    	video = document.getElementById("camera");
    	canvas = document.getElementById("canvas");
    	photo = document.getElementById("photo");
    	startbutton = document.getElementById("takeCamera");
    	useImage = document.getElementById("useImage");

    	navigator.mediaDevices.getUserMedia({video: true, audio: false})
    		.then(function(stream) {
    			video.srcObject = stream;
    			video.play();
    		}).catch(function(err) {
    			console.log(err);
    		});

    	video.addEventListener('canplay', function(ev) {
    		if (!streaming) {
    			height = video.videoHeight / (video.videoWidth/width);
      
		        video.setAttribute('width', width);
		        video.setAttribute('height', height);
		        canvas.setAttribute('width', width);
		        canvas.setAttribute('height', height);
		        streaming = true;
    		}
    	}, false);

    	// Add listener for taking a picture after initialisation
    	startbutton.addEventListener('click', function(ev){
    		photo.style.display = "block";
	      	takepicture();
	      	useImage.style.display = "inline";
	      	ev.preventDefault();
	    }, false);

    	// Listener for if the user wants to use the camera image as official
	    useImage.addEventListener('click', function(ev) {
	    	useImageFunc();
	    	ev.preventDefault();
	    }, false);

	    clearPhoto();

	    // When initialising the video stream, scroll to show it
	    $('html, body').animate({scrollTop: $('#camera').offset().top}, 500);
    }

    // Take a still shot of the video stream
	function takepicture() {
	    var context = canvas.getContext('2d');
	    if (width && height) {
	      canvas.width = width;
	      canvas.height = height;
	      context.drawImage(video, 0, 0, width, height);
	    
	      var data = canvas.toDataURL('image/png');
	      photo.setAttribute('src', data);
	    } else {
	      clearphoto();
	    }
	}

	// Listener for the start button to start the video stream
	$('#startCamera').on('click', function(ev) {
		document.getElementById('cameraSection').style.display = "block";
		beginCamera('cameraSection')
	});

	// Check for validation of certain fields before sending the data. 
	$('.submitButton').on('click', function(ev) {
		if ($('div.checkbox-group.required :checkbox:checked').length <= 0) {
			ev.preventDefault();
			document.getElementById('cuisineTypeHelp').style.display = "block";
			$('html, body').animate({scrollTop: $('#cuisineTypeHelp').offset().top}, 500);
		}

		console.log(usingCameraImage);
		if ($('#photosInput')[0].files.length <= 0 && !usingCameraImage) {
			ev.preventDefault();
			document.getElementById('photoHelp').style.display = "block";
			$('html, body').animate({scrollTop: $('#photoHelp').offset().top}, 500);
		}
	})

});