require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');

const MUSTACHE_MAIN_DIR = './main.mustache';
const CITY = 'Stockholm';
const DATE_OPTIONS = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZoneName: 'short',
};

async function doStuff() {
  let DATA = {
    refresh_date: new Date().toLocaleDateString('sv-SE', DATE_OPTIONS),
    city_temperature: 'N/A',
    city_weather: '',
    city_weather_icon: '',
  };

  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then(r => r.json())
    .then(r => {
      DATA.city_temperature = r.main.temp;
      DATA.city_weather = r.weather[0].main;
      DATA.city_weather_icon = r.weather[0].icon;
      console.log('RR', r);
    });

  fs.readFile(MUSTACHE_MAIN_DIR, function (err, data) {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

doStuff();
