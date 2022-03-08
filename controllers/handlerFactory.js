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

exports.updateOne = (Model) =>
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

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id); // query sera el valor de la busqueda por el id.
    if (popOptions) query = query.populate(popOptions); // Si hay un objeto de obsiones de rellenar
    const doc = await query; // la busqueda mas el campo que queremos poblar en dado caso que exista,

    // Si encontranos el doc, creanos una nueva estancia.
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
