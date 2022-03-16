/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations); // Leemos los datos de data-locations en Pug.
console.log(locations);

const tokenPlaceHolder =
  'pk.eyJ1IjoiZWxkZXphdmFsYSIsImEiOiJjbDB0d3RsNjEwcnV5M2pvMnZ4dHR6Mmk2In0.T_TrymVuHSQmLyHxt7KaIA';

mapboxgl.accessToken = tokenPlaceHolder;
var map = new mapboxgl.Map({
  container: 'map',
  //   style: 'mapbox://styles/eldezavala/cl0ttrbpm000l14oqp1opuquu',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-118.113491, 34.1117545], // first longitude after latitude
  zoom: 10,
  interactive: false,
});
