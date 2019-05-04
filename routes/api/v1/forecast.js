var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var pry = require('pryjs');
const Forecast = require('../../../helpers/forecast');

var User = require('../../../models').User;

router.get('/', function(req, res) {
  let lat;
  let lng;
  let address;
  let locationUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.location}&key=${process.env.GEOCODING_API_KEY}`;
  User.findOne({
    where: {
      api_key: req.body.api_key
    }
  })
      .then( user => {
        if(!user){
          res.sendStatus(401);
        } else{
            fetch(locationUrl)
              .then(response => {
                return response.json()
              })
              .then(data => {
                console.log(data);
                lat = data.results[0].geometry.location.lat
                lng = data.results[0].geometry.location.lng
                address = data.results[0].formatted_address
                let forecastUrl = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${lat},${lng}?exclude=[minutely,alerts,flags]`;
                fetch(forecastUrl)
                  .then(response => {
                    return response.json();
                  })
                  .then(forecastData => {
                    var forecast = new Forecast(address, forecastData)
                    res.status(200).send(forecast);
                  })
                  .catch(error => {
                    res.send(error);
                  });
              });
          }
      })
      .catch(error => console.log(error));
  });

module.exports = router;
