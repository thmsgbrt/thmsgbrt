require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const instagramService = require('./services/instagram.service');

const MUSTACHE_MAIN_DIR = './main.mustache';
const CITY = 'Stockholm';

async function generateNewReadme() {
  let DATA = {
    refresh_date: new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
      timeZone: 'Europe/Stockholm',
    }),
  };

  /**
   * Fetch Weather
   */
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then(r => r.json())
    .then(r => {
      DATA.city_temperature = Math.round(r.main.temp);
      DATA.city_weather = r.weather[0].description;
      DATA.city_weather_icon = r.weather[0].icon;
      DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Stockholm',
      });
      DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Stockholm',
      });
    });

  /**
   * Get pictures
   */
  const getImages = await instagramService.start();
  DATA.img1 = getImages[0];
  DATA.img2 = getImages[1];
  DATA.img3 = getImages[2];

  fs.readFile(MUSTACHE_MAIN_DIR, function (err, data) {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

generateNewReadme();
