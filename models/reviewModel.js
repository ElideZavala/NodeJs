// review / rating / createAt / ref yo tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
  },
  {
    // nos aseguramos que cuando tengamos una propiedad virtual , un campo no este almacenado en la base de datos, sino que se calcule usando algun valor.
    toJSON: { virtuals: true }, // Los JSON se genera virtualmente .
    toObject: { virtuals: true }, // Los Objetos se generan Igualmente Virtualmente.
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // cada combinacion sera Unica.

// Prevenir reviews double
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //cada combinación de tour y user debe ser

// Vamos sobre todos los que se empiezen find.
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo', // En este caso solo necesitaremos el Nombre y la Foto.
  });

  next(); // continuar hacia el siguiente middlewer, de lo contrario se quedara en este.
});

// Realizamos el promedio de las calificaciones que vamos dando. // Metodo Estatico.
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // Canalizacion de agregacion apuntando al modelo actual
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour', // Agrupamos por recorridos.
        nRating: { $sum: 1 }, // Contara los recorridos realizados, si hay 5 documentos contara 5.
        avgRating: { $avg: '$rating' }, // Calculamos el promedio de rating
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    // Actualizamos todos los valores de nuestra BD de Tours.
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
    // En caso de que no existan resultados regresamos valores predeterminados.
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// post es despues de la app, ya que todos los documentos estaran guardados, No contiene next.
reviewSchema.post('save', function () {
  // this point to current review
  // El constructor es basicamente el modelo que creo ese documento, representado la gira.
  this.constructor.calcAverageRatings(this.tour);
});

// <=== Actualizar para un solo recorrido.
// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.revizar = await this.findOne();
  // console.log(this.revizar);
  next();
});

// Despues de que la consulta se haya finalizado y la revision actualizado, podemos llamar calcAverageRatings
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); <-- does NOT work here, query has already executed.
  await this.revizar.constructor.calcAverageRatings(this.revizar.tour);
});

// Pasar datos del middleware previo al middleware posterior.

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
