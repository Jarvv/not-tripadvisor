$(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});


// We can watch for our custom `fileselect` event like this
$(document).ready( function() {
    $(':file').on('fileselect', function(event, numFiles, label) {

	    var input = $(this).parents('.form-group .photos').find(':text'),
	        log = numFiles > 1 ? numFiles + ' files selected' : label;

	    if( input.length ) {
	        input.val(log);
	    } else {
	        if( log ) alert(log);
	    }

    });

    var streaming = false;

    var width = 320;
    var height = 0;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    var usingCameraImage = false;

    function clearPhoto() {
	    var context = canvas.getContext('2d');
	    context.fillStyle = "#AAA";
	    context.fillRect(0, 0, canvas.width, canvas.height);

	    var data = canvas.toDataURL('image/png');
	    photo.setAttribute('src', data);
	}

	function useImageFunc() {
		document.getElementById("cameraFile").value = photo.src;
		document.getElementById("imagesPlaceholder").placeholder = "Images added: Camera Image";
		usingCameraImage = true;
	}

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

    	startbutton.addEventListener('click', function(ev){
    		photo.style.display = "block";
	      	takepicture();
	      	useImage.style.display = "inline";
	      	ev.preventDefault();
	    }, false);

	    useImage.addEventListener('click', function(ev) {
	    	useImageFunc();
	    	ev.preventDefault();
	    }, false);

	    clearPhoto();

	    $('html, body').animate({scrollTop: $('#camera').offset().top}, 500);
    }

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

	$('#startCamera').on('click', function(ev) {
		document.getElementById('cameraSection').style.display = "block";
		beginCamera('cameraSection')
	});

	$('.submitButton').on('click', function(ev) {
		if ($('div.checkbox-group.required :checkbox:checked').length <= 0) {
			ev.preventDefault();
			document.getElementById('cuisineTypeHelp').style.display = "block";
			$('html, body').animate({scrollTop: $('#cuisineTypeHelp').offset().top}, 500);
		}

		// console.log(usingCameraImage);
		// if ($('#photosInput')[0].files.length <= 0 && !usingCameraImage) {
		// 	ev.preventDefault();
		// 	document.getElementById('photoHelp').style.display = "block";
		// 	$('html, body').animate({scrollTop: $('#photoHelp').offset().top}, 500);
		// }
	})

});