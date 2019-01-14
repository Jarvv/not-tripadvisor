var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var photo = require('../controllers/photo');

router.post('/photo', photo.insert);

module.exports = router;