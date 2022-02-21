class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // si el String empieza con 4. sera true.
    this.isOperational = true; // Todos los errores creados seran operativos, nuestro controlador de errores.

    Error.captureStackTrace(this, this.constructor); // Especificamos el objeto actual y a ala clase.
  }
}

module.exports = AppError;
