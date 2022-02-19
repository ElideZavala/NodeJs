const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
// Instalamos morgan.
// npm i morgan

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Estado de nuestra peticion.
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // No logramos entrar a las imagenes.

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // Optenemos la hora Actual.
  next();
});

// 3) ROUTES // Hemos Importados las Rutas.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// .all Se ejecuta para todos los verbos{get, post, patch, delete} * Representara que todo esta bien
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`, // Error de no podemos encontrar la pagina orginal.
  });
});

// Exporatmos app para poder utilizarlo en server
module.exports = app;
