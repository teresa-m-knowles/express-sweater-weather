var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;
const random_key_generator = require('uuid/v4');

var User = require('../../../models').User;

router.post('/', function(req, res) {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
  .then( user => {
    if(!user){
      res.send("No user with that email found")
    } else{
      bcrypt.compare(req.body.password, user.password)
        .then(function(result) {
          if(result == true) {
            res.setHeader("Content-Type", "application/json");
            // res.sendStatus(200);
            res.send(JSON.stringify({
              'api_key': user.api_key
            }));
          } else{
            res.sendStatus(401);
          }
        })
        .catch( error => {
          res.sendStatus(500).send({error});
        });
    }
  })
  .catch( error => {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send({error});
  })
})

module.exports = router;
