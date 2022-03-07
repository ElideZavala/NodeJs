const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404)); // return para parar y ni pasar al sig codigo.
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) => {
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Corremo igualmente los validadores de nuestro modelo.
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404)); // return para parar y ni pasar al sig codigo.
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
