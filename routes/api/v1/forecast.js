var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var pry = require('pryjs');

var geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json?'

var User = require('../../../models').User;

var locationData = function(res, address) {
  let locationUrl = 'address=' + address;
  let apiKeyUrl = `&key=${process.env.GEOCODING_API_KEY}`;
  let url = geocodingUrl + locationUrl + apiKeyUrl;

  fetch(url)
    .then(response => response.json())
    .then(result => res.send(result))
    .catch(error => response.send({error}));
};



router.get('/', function(req, res) {
  User.findOne({
    where: {
      api_key: req.body.api_key
    }
  })
  .then( user => {
    if(!user){
      res.sendStatus(401);
    } else {
      locationData(res, req.query.location);
    }
  })
  .catch(error => {
    res.send({error});
  });
});



module.exports = router;
