const mongoose = require('mongoose');
const dotenv = require('dotenv'); // IMPORTAMOS dotenv PARA PODER USARLO.
const app = require('./app');

dotenv.config({ path: './config.env' }); // CONFIGURAMOS LA UBICACION DEL ARCHIVO CONFIG.

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Methodo of connection.
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // devolvera una promesa
    console.log(con.connections);
    console.log('DB connection successful!');
  });

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
