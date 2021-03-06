const express = require('express');
const path = require('path'); // Nos permite modificar la rutas de nuestros directorios.
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingController = require('./controllers/bookingController');

const app = express();

app.enable('trust proxy'); // Para que nuestra app confien y acepte nuestras proxys.

// Instalamos morgan.
// npm i morgan

// Configuramos nuestro motor PUG
app.set('view engine', 'pug'); // Motor de plantilla PUG.
app.set('views', path.join(__dirname, 'views')); // Configuración de vista. // evita error si falta barra oblicua..

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(
//   cors({
//     origin: 'https://www/natours.com', // Origen de nuestra Api en dado caso que solo queramos una o de otras paginas
//   })
// );

app.options('*', cors()); // <-- a Todas las paginas.
// app.options('/api/v1/tours/:id', cors()); // <-- a una URL especifica, se pudieran hacer modificaciones.

// Serving static  files
app.use(express.static(path.join(__dirname, 'public'))); // Por si nos falla la barra "/"
// Todos los archivos estaticos se serviran automaticamente desde una carpeta llamada pública

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

// Cuando recibimos el cuerpo de Stripe, la funcion de Stripe que luego usaremos pra leer el cuerpo necesita este cuerpo en forma cruda, asi que basicamente como una cadena y no como JSON. NO PASE AL CODIGO SIGUIENTE 🔽.
// Analizador del cuerpo CRUDO.
app.post(
  '/webhook-checkout',
  express.raw({ type: 'aplication/json' }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body // Analizador Corporal.
app.use(express.json({ limit: '10kb' })); // cuando tengamos un cuerpo con mas de 10kb no sera acceptado.
// Obtener los valores del; formulario o codificacion de la Url.
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // limite de cambios con solo 10kb.
app.use(cookieParser()); // <-- Analizara los datos de Cookie.

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // Mira el cuerpo de la solicitudm cadena de consulta de la solucitud y las  signo de dolar.

// Data satization against XSS  // Codigo malicioso a nuestro HTML
app.use(xss());

// Prevent parameter pollution // aclaramos la cadena de consulta.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage ',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression()); // Comprimira todo el texto que se envia a los clientes.

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // Optenemos la hora Actual.
  next();
});

// 3) ROUTES // Hemos Importados las Rutas.

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// .all Se ejecuta para todos los verbos{get, post, patch, delete} * Representara que todo esta bien
app.all('*', (req, res, next) => {
  // Utilizamos Error para establer una variable de error y poder ser utlizada en futuros errores.
  // Importamos nuestra clase la cual mandamos nuestro msg de Error y el status de la  peticion a la API.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // El error pasara al siguiente middleware
});

app.use(globalErrorHandler); // Ejecutamos la funccion de Errores

// Exportamos app para poder utilizarlo en server
module.exports = app;
