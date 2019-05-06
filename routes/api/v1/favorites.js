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

router.get("/", function(req, res){
  let favorites = [];
  let favoriteLocations;
  User.findOne({
    where: {
      api_key: req.body.api_key
    },
    include: [Location]
  })
    .then(user => {
      !user ? res.status(401).send(JSON.stringify("Invalid API key")) :
      user.getLocations()
        .then(locations => {
          favorites = locations.map(location => {
            let forecastUrl = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${location.lat},${location.lng}?exclude=[minutely,alerts,flags]`;
            return favoriteLocations = fetch(forecastUrl)
              .then(response => {
                return response.json()
              })
              .then(forecastData => {
                var favorite = new FavoriteFormat(location.cityState, forecastData);
                return favorite;
              })
              .catch(error => {
                console.log(error);
                res.status(500).send(JSON.stringify("Unable to get locations forecast"))
              })


          })
          Promise.all(favorites)
          .then(response => {
            res.setHeader("Content-Type", "application/json");
            res.status(200).send(JSON.stringify(response));
          })
          .catch(error => {
            console.log(error)
            res.status(500).send(JSON.stringify("Unable to get JSON object"))
          })
          })
        .catch(error => {
          console.log(error)
          res.status(500).send(JSON.stringify("Unable to get user's favorite locations"))
        })
    })
    .catch(error => {
      res.status(500).send(JSON.stringify("Unable to connect to the database to find user"))
    })
});

router.delete("/", function(req, res) {
  let locationUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.location}&key=${process.env.GEOCODING_API_KEY}`;

  User.findOne({
    where: {
      api_key: req.body.api_key
    },
    include: [Location]
  })
    .then(user => {
      if(!user){
        res.status(401).send(JSON.stringify("Invalid API key"))
      } else{
        fetch(locationUrl)
          .then(response => {
            return response.json()
          })
          .then(data => {
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
                console.log(location);
                console.log(user.id);
                console.log(location.id);
                Favorite.destroy({
                  where: {
                    UserId: user.id,
                    LocationId: location[0].dataValues.id
                  }
                })
                  .then(removedLocation => {
                    if(removedLocation == 0) {
                      res.status(400).send(JSON.stringify(`${req.body.location} was not in your favorites`))
                    } else{
                      console.log(removedLocation);
                      res.setHeader("Content-Type", "application/json");
                      res.sendStatus(204);
                    }

                  })
                  .catch(error => {
                    console.log(error);
                    res.status(500).send(JSON.stringify("UUnable to connect to database to remove favorite location"))
                  })

              })
              .catch(error => {
                console.log(error);
                res.status(500).send(JSON.stringify("Unable to connect to database to find user favorite locations"))
              })

          })
          .catch(error => {
            console.log(error);
            res.status(500).send(JSON.stringify(`Unable to find ${req.body.location}'s latitude and longitude`))
          })

      }
    })
    .catch(error => {
      res.status(500).send(JSON.stringify("Unable to connect to database to find user"))
    })
});



module.exports = router;
