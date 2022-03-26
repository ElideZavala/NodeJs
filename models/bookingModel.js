/* eslint-disable */
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belog to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belog to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// Todos los pre-middleware tienen acceso a la siguiente funcion. next(), siempre tenemos que llamarla.
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name', // seleccionamos el nombre del tour.
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
