const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');

// Se ejecutara antes de createReview.
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes.
  if (!req.body.tour) req.body.tour = req.params.tourId; // Si no hay usuario en el cuerpo establecer la del params.
  if (!req.body.user) req.body.user = req.user.id; // si no usuario en el cuerpo, llenar con el user.id.
  next();
};

// Traermos todas la review:
exports.getAllReviews = factory.getAll(Review);
// Get to review
exports.getReview = factory.getOne(Review);
// Create to review
exports.createReview = factory.createOne(Review);
// Update to review
exports.updateReview = factory.updateOne(Review);
// Delete to review
exports.deleteReview = factory.deleteOne(Review);
