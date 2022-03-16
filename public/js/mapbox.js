/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations); // Leemos los datos de data-locations en Pug.
console.log(locations);
console.table(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWxkZXphdmFsYSIsImEiOiJja25kcXlla2UxbHRuMm9wamhkOGVrdzZtIn0.9v_hf7Wox73rxt3HeFIX8A';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
