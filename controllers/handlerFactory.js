const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

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

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; // Si hay un tour este filtro debe ser igual a tour.

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query) //analizamos un objeto de consulta y la cadena de consulta que proviene de express.
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query; // Esperamos la consulta para que pueda regresar con todos los documentos.

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
