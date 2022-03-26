/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signUp', // Hacemos la peticion a esta URL
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!'); // Mandamos mensaje de logeo exitoso.
      window.setTimeout(() => {
        location.assign('/'); // entramos a la pagina principal en 1.5 segundos automaticamente.
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: 'http://127.0.0.1:3000/api/v1/users/logout',
//     });

//     if ((res.data.status = 'success')) location.reload(true); // Forzara una recarga desde el servidor y no desde el cache.
//   } catch (error) {
//     console.log(error.response);
//     showAlert('error', 'Error logging out! try again.');
//   }
// };
