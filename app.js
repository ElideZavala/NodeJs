const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Instalamos morgan.
// npm i morgan

// 1) GLOBAL MIDDLEWARES
// Set securuty HTTP headers
app.use(helmet());

// DEVELOPMENT LOOGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Estado de nuestra peticion.
}

// Limit request from same API
const limiter = rateLimit({
  max: 100, // Maximo de solicitudes. // poner limites a las solicitudes de una API..
  windowMs: 60 * 60 * 1000, // Ventana de tiempo en 1hr quiero 100 solicitudes.
  message: 'Too many request from this IP, please try again in an hour', // Demasiadas solicitudes de esta IP.
});

app.use('/api', limiter); //Afectara a todas las rutas que comiencen con esto, limitar a 100 valores.

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // cuando tengamos un cuerpo con mas de 10kb no sera acceptado.

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // Mira el cuerpo de la solicitudm cadena de consulta de la solucitud y las  signo de dolar.

// Data satization against XSS  // Codigo malicioso a nuestro HTML
app.use(xss());

// Prevent parameter pollution // aclaramos la cadena de consulta.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static  files
app.use(express.static(`${__dirname}/public`)); // No logramos entrar a las imagenes.

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // Optenemos la hora Actual.
  // console.log(req.headers);
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
