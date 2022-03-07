const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Traermos todas la review:
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }; // Si hay un tour este filtro debe ser igual a tour.

  const reviews = await Review.find(filter); // Buscaremos todas las reseñas de este Id tour.

  // Respuesta
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Se ejecutara antes de createReview.
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes.
  if (!req.body.tour) req.body.tour = req.params.tourId; // Si no hay usuario en el cuerpo establecer la del params.
  if (!req.body.user) req.body.user = req.user.id; // si no usuario en el cuerpo, llenar con el user.id.
  next();
};

// Create to review
exports.createReview = factory.createOne(Review);
// Update to review
exports.updateReview = factory.updateOne(Review);
// Delete to review
exports.deleteReview = factory.deleteOne(Review);
