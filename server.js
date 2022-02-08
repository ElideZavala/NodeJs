const dotenv = require('dotenv'); // IMPORTAMOS dotenv PARA PODER USARLO.
dotenv.config({ path: './config.env' }); // CONFIGURAMOS LA UBICACION DEL ARCHIVO CONFIG.

const app = require('./app');

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
