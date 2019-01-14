var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var user = require('../controllers/user');

// Helper route to check session information
router.get('/checkSession', user.checkSession);

router.post('/', user.insert);

module.exports = router;