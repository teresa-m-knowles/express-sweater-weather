var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;
const random_key_generator = require('uuid/v4');

var User = require('../../../models').User;


/* GET users listing. */
router.post('/', function(req, res) {
  var email = req.body.username

  if(req.body.password === req.body.password_confirmation){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      User.create({
        email: req.body.email,
        password: hash,
        api_key: random_key_generator()
      })
      .then( user => {
        res.setHeader("Content-Type", "application/json");
        res.status(201).send(JSON.stringify(user.api_key));
      })
      .catch( error => {
        res.setHeader("Content-Type", "application/json");
        res.status(500).send({error});
      })
    })
  }
  
module.exports = router;
