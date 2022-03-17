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
  scrollZoom: false,
  //   center: [-118.113491, 34.1117545], // first longitude after latitude
  //   zoom: 10,
  //   interactive: false,
});

// Area que se mostrara en el mapa
const bounds = new mapboxgl.LngLatBounds();

// Creamos un nuevo elemento HTML
locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom', // En la parte inferior del elemento se ubicara la ubicacion exacta del GPS.
  })
    .setLngLat(loc.coordinates) // <-- configuramos la latitud y longitud de estas coordenadas.
    .addTo(map); // <-- agregamos nuestra variable de map.

  // Add popup // <-- Colocamos un parrafo en las coordenadas.
  new mapboxgl.Popup({
    offset: 30, // <-- Desplazamiento del parrafo.
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`) // <-- Colocamos un parrafo con la descripcion.
    .addTo(map);

  // Extend map bounds to include current location. // Extendemos los limites con nuestras coordenadas.
  bounds.extend(loc.coordinates);
});

// Ajustar a los limites // Agregamos margen a nuestras ubicaciones.
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
