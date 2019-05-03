var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fetch = require('node-fetch');

var pry = require('pryjs');
var User = require('../../../models').User;
var Location = require('../../../models').Location;

router.post("/", function(req, res) {
  User.findOne({
    where: {
      api_key: req.body.api_key
    }
  })
    .then ( user => {
      if(!user){
        res.sendStatus(401);
      } else{
        //fetches here
        console.log("got here")
      }
    })

    .catch(error => res.send({error}));
})
module.exports = router;
