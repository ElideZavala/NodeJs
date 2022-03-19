/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert'); // <-- Seleccionamos la clase alert.
  if (el) el.parentElement.removeChild(el);
};

// type is "success" of "error"
export const showAlert = (type, msg) => {
  hideAlert(); // <-- si existe una alerta la vamos a eliminar.
  const markup = `<div class="alert alert--${type}">${msg}</div>"`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup); // dentro del cuerpo pero desde el principio.
  window.setTimeout(hideAlert, 5000);
};
