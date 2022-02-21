class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // si el String empieza con 4. sera true.
    this.isOperational = true; // Lo creamaos para probar la propiedad y solo enviar msg

    Error.captureStackTrace(this, this.constructor); // Especificamos el objeto actual y a ala clase.
  }
}

module.exports = AppError;
