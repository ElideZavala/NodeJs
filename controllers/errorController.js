module.exports = (err, req, res, next) => {
  // El modulo de exportacion sera igual a esta funcion
  //   console.log(err.stack); // Nos muestra la direccion de nuestro error. // Seguimiento de la pila

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
