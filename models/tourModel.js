const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // Mostrara error si no se pasa este campo.
      unique: true, // El dato debe ser unico entre todos los datos de la base de datos.
      trim: true, // Eliminara los espacios vacios que sean creados.
      maxlength: [40, 'A tour name must have less or equal then 40 characters'], // maximo de caracteres.
      minlength: [10, 'A tour name more have more or equal then 10 characters'], // minimo de caracteres.
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
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
      enum: {
        values: ['easy', 'medium', 'difficult'], // Valores acetados
        message: 'Difficulty is either: easy, medium, difficulty', // msg de error si colocamos otra que no es.
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, // Numero por defecto en caso de que no tenga ninguno
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'], // Rango, comentario del error.
    },
    ratingsQuantity: {
      type: Number,
      default: 0, // Numero por defecto en caso de que no tenga ninguno
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // This only points to current doc on NEW document creation
          return val < this.price; // El precio puede ser menor al precio real, pero no mayor.
        },
        message: 'Discount price ({VALUE}) shoult be below regular price',
      },
    },
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
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point', // Valor determinado seria un punto.
        emum: ['Point'], // Opciones posibles --Solo una.
      },
      coordinates: [Number], // Las cordenadas seran tanto la latiud como la longitud.
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        addres: String,
        description: String,
        day: Number, // Dia del Tour en que la gente acudira a este lugar.
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId, // Esperamos que los elementos de la matriz de guias sea un ID de MongoDB.
        ref: 'User', // Hacemos referencia a nuestro modelo de User en MongoDB, sin necesidad de importarlo.
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // Los JSON se genera virtualmente .
    toObject: { virtuals: true }, // Los Objetos se generan Igualmente Virtualmente.
  }
);

// tourSchema.index({ price: 1 }); // Establecemos el indice de modo ascendente, cuado es negativo(-1), seria de manera desendente.
tourSchema.index({ price: 1, ratingsAverage: -1 }); // Establecemos el indice de modo ascendente, cuado es negativo(-1), seria de manera desendente.

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // Del tourSchema nos devolvera la duration la cual la dividiremos con los dias de la semana, y sera el valor de durationWeeks.
});

// Virtual populate Realizar el Schema virtual de review
tourSchema.virtual('reviews', {
  ref: 'Review',
  //Identificamos el campo extranjero y el campo local
  foreignField: 'tour', // Donde se almacena la referencia al modelo actual.
  localField: '_id', // El id es como se llama 'tour' en el modelo extranjero, alla se llama tour aqui _Id
});

// DOCUMENT MIDDLEWARE: run before .save() and .create() .insertMany // Se ejecutara antes del evento real.
// El documento se ve en la consola justo antes de guardarlo en la base de datos.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // Convertimos todo a minuscula.
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // mapeo de los valores y buscando al usuarion con el Id proporcionado.
//   this.guides = await Promise.all(guidesPromises); // Vamos a esperar a todos los usuarios vallen apareciendo.

//   next();
// });

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
tourSchema.pre(/^find/, function (next) {
  // /^find/, Se debe ejecutar con todos los valores que empicen con find.
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } }); // Encontrar un secretTour que no sea igual a true.( No son secretos)

  this.start = Date.now(); // Fecha actual
  next();
});

tourSchema.pre(/^find/, function (next) {
  // Apuntara a la consulta actual.
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', // Excluimos estos valores del usuario en guides.
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`); // calculamos cuanto tiempo toma en ejecutarse
  next();
});

// AGGREGATION MIDDLEWARE // Canalizacion de nuesto esquema formado en getTourStats con Tour.aggregate
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // Agregamos elementos a nuestro pipeline()
  // los cuales son los secretTour que no sean true, eliminando los otros.
  console.log(this.pipeline()); // con this ejecutamos un aggregate y
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
