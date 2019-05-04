var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fetch = require('node-fetch');

var pry = require('pryjs');
var User = require('../../../models').User;
var Location = require('../../../models').Location;

router.post("/", function(req, res) {
  let locationUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.location}&key=${process.env.GEOCODING_API_KEY}`;

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
        fetch(locationUrl)
          .then( response => {
            return response.json();
          })
          .then( data => {
            let lat = data.results[0].geometry.location.lat
            let lng = data.results[0].geometry.location.lng
            let address = data.results[0].formatted_address

            Location.findOrCreate({
              where: {
                cityState: address
              },
              defaults: {
                lat: lat,
                lng: lng
              }
            })
            .then(location => {
              user.addLocation(location[0].dataValues.id)
                .then(favorite => {
                  console.log(favorite)
                  res.status(200).send(JSON.stringify({message: `${req.body.location} has been added to your favorites.`}))
                })
                .catch(error => {
                  res.status(500).send({error});
                })
            })

          })
      }
    })

    .catch(error => res.send({error}));
})
module.exports = router;
