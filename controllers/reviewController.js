const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


// Traermos todas la review:
exports.getAllReview = catchAsync(async (req, res, next) => {
    const review = await Review.find();
    
    // Respuesta
    res.status(200).json({
        status: 'success',
        results: review.length,
        data: {
            review,
        },
    });
});

// Traernos una Review con el nombre
exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    
    if(!review) {
        next(AppError('No review found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review,
        }
    })
}
// Crear una review
exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// Actualizar la review
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
});

// Delete a review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
});
