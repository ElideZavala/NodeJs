const mongoose = require('mongoose');

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

module.exports = Tour;
