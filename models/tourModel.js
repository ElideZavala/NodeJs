const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // Mostrara error si no se pasa este campo.
      unique: true, // El dato debe ser unico entre todos los datos de la base de datos.
      trim: true, // Eliminara los espacios vacios que sean creados.
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingAverage: {
      type: Number,
      default: 4.5, // Numero por defecto en caso de que no tenga ninguno
    },
    ratingQuantity: {
      type: Number,
      default: 0, // Numero por defecto en caso de que no tenga ninguno
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    // Crearemos un pequeño resumen.
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      require: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false, // no se mostrara el field en la peticion por el cliente.
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // Los JSON se genera virualmente .
    toObject: { virtuals: true }, // Los Objetos se generan Igualmente Virtualmente.
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // Del tourSchema nos devolvera la duration la cual la dividiremos con los dias de la semana, y sera el valor de durationWeeks.
});

// DOCUMENT MIDDLEWARE: run before .save() and .create() .insertMany // Se ejecutara antes del evento real.
// El documento se ve en la consola justo antes de guardarlo en la base de datos.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // Convertimos todo a minuscula.
  next();
});

// Gancho previo al guardado.
// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// Se ejecuta primero por que estamos en un gancho de busqueda con this.
tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } }); // Encontrar un secretTour que no sea igual a true.( No son secretos)
  next();
});

tourSchema.pre('findOne', function (next) {
  this.find({ secretTour: { $ne: true } }); // Encontrar un secretTour que no sea igual a true.( No son secretos)
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
