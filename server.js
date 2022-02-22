const mongoose = require('mongoose');
const dotenv = require('dotenv'); // IMPORTAMOS dotenv PARA PODER USARLO.

dotenv.config({ path: './config.env' }); // CONFIGURAMOS LA UBICACION DEL ARCHIVO CONFIG.
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Methodo of connection.
mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  // Conectarnos a la base de datos
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log('ERROR'));

// SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Emicion de conceptos con errores .on => como encendido
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message); // Registramos todos los errores en la consola.
  console.log('UNHANDLER REJECTION! 🎃🕯 Shutting down...');
  server.close(() => {
    // Cerrara el servidor y ejecutara los siguiente.
    process.exit(1); // Apagar el Servidor.
  });
});
