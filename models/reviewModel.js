// review / rating / createAt / ref yo tour / ref to user
const mongoose = require('mongoose');

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

// Prevenir reviews double
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //cada combinación de tour y user debe ser

// Vamos sobre todos los que se empiezen find.
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name', // En este caso solo necesitaremos el Nombre y la Foto.
  });

  next(); // continuar hacia el siguiente middlewer, de lo contrario se quedara en este.
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // Canalizacion de agregacion apuntando al modelo actual
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    // {
    //   $group: {
    //     _id: '$tour', // Agrupamos por recorridos.
    //     nRating: { $sum: 1 }, // Contara los recorridos realizados, si hay 5 documentos contara 5.
    //     avgRating: { $avg: '$rating' }, // Calculamos el promedio de rating
    //   },
    // },
  ]);
  console.log(stats);
};

// post es despues de la app, ya que todos los documentos estaran guardados.
reviewSchema.post('save', function (next) {
  // this point to current review
  // El constructor es basicamente el modelo que creo ese documento, representado la gira.
  this.constructor.calcAverageRatings(this.tour);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
