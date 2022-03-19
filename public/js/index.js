/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el.nav__el--logout');

// DELEGATION  // <-- Si en el documento existe mapBox evitara que se ejecute en otros archivos.
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations); // Leemos los datos de data-locations en Pug.
  displayMap(locations);
}

// 🔽 Si existe en la Pag se ejecutara el siguiente codigo.
// Al dar summit se envian los valores de la contraseña y el password
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
