var fetch = require('node-fetch');
var pry = require('pryjs');
var Forecast = require('./forecast')


module.exports = class FavoriteFormat extends Forecast{
  constructor(location, forecastData){
    super(location, forecastData)
    this.current_weather = this.currently;
    delete this.daily;
    delete this.hourly;
    delete this.currently;
  }

  }
