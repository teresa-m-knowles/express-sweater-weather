var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var pry = require('pryjs');

var geocoding_url = 'https://maps.googleapis.com/maps/api/geocode/json?'

var User = require('../../../models').User;

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
      console.log('authorized user with api_key ' + user.api_key);
      let location_url = 'address=' + req.query.location;
      let api_key_url = `&key=${process.env.GEOCODING_API_KEY}`;
      let url = geocoding_url + location_url + api_key_url;

      console.log(url);
      fetch(url)
      .then( res => res.json())
      .then( address_data => {
        res.send( { address_data });
      })
      .catch(error => {
        res.send({error});
        console.log("error in fetch");
      });
    }
  })
  .catch(error => {
    res.send({error});
  });
});

module.exports = router;
