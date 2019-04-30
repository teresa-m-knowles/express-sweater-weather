var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET users listing. */
router.post('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
