// review / rating / createAt / ref yo tour / ref to user
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    default: 0,
  },
  createAt: Date,
  location: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
  ],
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
  ],
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
