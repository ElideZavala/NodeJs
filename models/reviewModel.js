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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
