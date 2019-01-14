$(document).ready(function() {

	var loginForm = $('#login-form');
	var registerForm = $('#register-form');
	var registerFormShow = $('#register');
	var loginFormShow = $('#reg_login_btn')


	registerFormShow.click(function(){
		loginForm.css("display", "none");
		registerForm.css("display", "block");
	});

	loginFormShow.click(function() {
		registerForm.css("display", "none");
		loginForm.css("display", "block");
	})
});