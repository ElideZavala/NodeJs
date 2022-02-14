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
  .then(() => console.log('DB connection successful!'));

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
