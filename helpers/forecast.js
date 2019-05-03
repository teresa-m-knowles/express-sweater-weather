var pry = require('pryjs');

module.exports = class Forecast {
  constructor(location, forecastData){
    this.location = location;
    this.currently = this.formatCurrentWeather(forecastData.currently);
    this.daily = forecastData.daily;
    this.hourly = forecastData.hourly;
  }

  formatCurrentWeather(data) {
    let format = {
      "summary": data.summary,
      "icon": data.icon,
      "precipIntensity":  data.precipIntensity,
      "precipProbability": data.precipProbability,
      "temperature": data.temperature,
      "humidity": data.humidity,
      "pressure": data.pressure,
      "windSpeed": data.windSpeed,
      "windGust": data.windGust,
      "windBearing": data.windBearing,
      "cloudCover": data.cloudCover,
      "visibility": data.visibility
    };

    return format;
  }
};
