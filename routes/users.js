var express = require('express');
var router = express.Router();
var user = require('../controllers/user');


/**
 * Post from the login modal. Calls authenicate and sets session if true.
 */
router.post('/', function(req, res, next) {
	if (req.body.email && req.body.pass) {
		login = false;
		user.authenticate(req.body.email, req.body.pass, function(result, user) {
			if (result) {
				login = false;
				res.redirect('/users/login')
			} else {
				req.session.userId = user;
				req.session.success = true;
				login = true;
				req.session.save((err) => {
					if (!err) {
						if (req.header('Referer').substr(-12) != '/users/login') {
							res.redirect(req.header('Referer'));
						} else {
							res.redirect('/')
						}
					}
				});
			}
		});
	} else {
		if (req.header('Referer').substr(-12) != '/users/login') {
			res.redirect(req.header('Referer'));
		} else {
			res.redirect('/users/login')
		}
	}
});

/**
 * Render the login page. This page is only rendered when a user attempts to 
 * access a page they need an authenicated session to access.
 */
router.get('/login', function(req, res, next) {
	res.render("login", {title: "Login", loggedIn: req.session.success} );
});

/**
 * Logout the user.
 * Destroys the authenticated session and returns the user to the home page.
 */
router.get('/logout', function(req, res, next) {
	if (req.session) {
		req.session.destroy(function(err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

module.exports = router;
