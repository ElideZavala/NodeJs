const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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
  // Utilizamos Error para establer una variable de error y poder ser utlizada en futuros errores.
  // Importamos nuestra clase la cual mandamos nuestro msg de Error y el status de la  peticion a la API.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // El error pasara al siguiente middleware
});

app.use(globalErrorHandler); // Ejecutamos la funccion de Errores

// Exportamos app para poder utilizarlo en server
module.exports = app;
