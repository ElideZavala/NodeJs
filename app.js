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
  console.log('Hello from the middleware 🙋‍♂️');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // Optenemos la hora Actual.
  next();
});

// 3) ROUTES // Hemos Importados las Rutas.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Exporatmos app para poder utilizarlo en server
module.exports = app;
