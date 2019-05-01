var express = require('express');
var router = express.Router();

var User = require('../../../models').User;

router.get('/', function(req, res) {
  console.log(req.query)
});

module.exports = router;
