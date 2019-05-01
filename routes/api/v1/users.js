var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;
const randomKeyGenerator = require('uuid/v4');

var User = require('../../../models').User;


router.post('/', function(req, res) {

  if(req.body.password === req.body.password_confirmation){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      User.create({
        email: req.body.email,
        password: hash,
        api_key: randomKeyGenerator()
      })
      .then( user => {
        res.setHeader("Content-Type", "application/json");
        res.status(201).send(JSON.stringify({'api_key':  user.api_key}));
      })
      .catch( error => {
        res.setHeader("Content-Type", "application/json");
        res.status(500).send({error});
      });
    });

  } else{
    res.status(500).send("Passwords do not match")
  }
});

module.exports = router;
