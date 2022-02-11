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
  // .connect(process.env.DATABASE_LOCAL, {
  // Conectarnos a la base de datos
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'], // Mostrara error si no se pasa este campo.
    unique: true, // el dato debe ser unico entre todos los datos de la base de datos.
  },
  rating: {
    type: Number,
    default: 4.5, // Numero por defecto en caso de que no tenga ninguno
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});
const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: ' The Forest Hiker',
  rating: 4.7,
  price: 497,
});

testTour
  .save()
  .then((doc) => console.log(doc))
  .catch((err) => console.log('ERROR🎇:', err));

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
