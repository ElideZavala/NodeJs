/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value); // Con el emtod append de la clase FormData.
    form.append('email', document.getElementById('email').value); // agregamos los valores.
    form.append('photo', document.getElementById('photo').files[0]); // agregamos la foto que esta en el array.
    // const photo = document.querySelector('img').setAttribute('src', url);
    console.log(form); // Datos del formulario.
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // const photo = document.querySelector('img').setAttribute('src', url);
    // console.log(photo);
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
