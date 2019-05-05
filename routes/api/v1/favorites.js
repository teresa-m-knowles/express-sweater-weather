var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var pry = require('pryjs');
var User = require('../../../models').User;
var Location = require('../../../models').Location;
var Favorite = require('../../../models').Favorite;
const Forecast = require('../../../helpers/forecast');
const FavoriteFormat = require('../../../helpers/favorite_format');


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
                  res.setHeader("Content-Type", "application/json");
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
});

router.get("/", function(req, res) {
  let favorites = [];

  User.findOne({
    where: {
      api_key: req.body.api_key
    },
    include: [Location]
  })
    .then( user => {
      !user ? res.sendStatus(401) :
        user.getLocations()
          .then(locations => {
            var userLocations = locations;
            for (i = 0; i < locations.length; i++) {
              let currentLocation = locations[i];
              let forecastUrl = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${currentLocation.lat},${currentLocation.lng}?exclude=[minutely,alerts,flags]`;
              fetch(forecastUrl)
                .then(response => {
                  return response.json()
                })
                .then(forecastData => {
                  var favorite = new FavoriteFormat(currentLocation.cityState, forecastData)
                  favorites.push(favorite);
                  return favorites;
                })
                .then(favoriteLocations => {
                  if (favorites.length == userLocations.length){
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).send(JSON.stringify(favorites));
                  }
                })
                .catch(error => console.log(error));
            }
          })

          .catch(error => {
            console.log(error);
            res.status(500).send(JSON.stringify(error));
          })

    })
    .catch(error => {
      res.status(500).send(error);
    })

});
module.exports = router;
