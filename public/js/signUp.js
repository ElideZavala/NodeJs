/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const singup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/singup', // Hacemos la peticion a esta URL
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'singed Up in successfully!'); // Mandamos mensaje de logeo exitoso.
      window.setTimeout(() => {
        location.assign('/'); // entramos a la pagina principal en 1.5 segundos automaticamente.
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
