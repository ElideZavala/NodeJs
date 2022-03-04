const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query) //analizamos un objeto de consulta y la cadena de consulta que proviene de express.
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query; // Esperamos la consulta para que pueda regresar con todos los documentos.

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id); // Nombre del campo que queremos completar, para poblar.
  // Tour.findOne({_id: req.params.id})

  // Si encontranos el tour, creanos una nueva estancia.
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); // return para parar y ni pasar al sig codigo.
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, // Corremo igualmente los validadores de nuestro tourModel(model).
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); // return para parar y ni pasar al sig codigo.
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); // return para parar y ni pasar al sig codigo.
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }, // coincidir elementos con rangos mayor a un promedio de 4.5.
    },
    {
      // Objetos dentro de objetos, llamado grupo
      $group: {
        _id: { $toUpper: '$difficulty' }, //  Especificar por alguna otra caracteristica.// se vera en MAYUSCULA
        numTours: { $sum: 1 }, // sumaremos el numero total de documentos.
        numRatings: { $sum: '$ratingAverage' }, //suma de las calificaciones
        avgRating: { $avg: '$ratingQuantity' }, // Calcularemos el promedio de los promedios.
        avgPrice: { $avg: '$price' }, // Calculamos el prommedio de los precion.
        minPrime: { $min: '$price' }, // Calculamos el precio mas bajo.
        maxPrime: { $max: '$price' }, // Calculamos el precio mas alto.
      },
    },
    {
      $sort: { avgPrice: 1 }, // Ordenamos por promedio-precio y ponemos 1 para ir ascendiendo.
    },
    {
      $match: { _id: { $ne: 'EASY' } }, // Nuevo Operador que no sea igual a EASY-Select document que no sean EASY
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // leemos el params de nuestra URL y la multiplicamos por 1.

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // desenvolverse? desarrollamos por la fecha.
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // Inicio del año.
          $lte: new Date(`${year}-12-31`), // Final del año.
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // extraemos el mes de la fecha, ubicada en startDates
        numTourStarts: { $sum: 1 }, // Para cada uno de los documentos agregamos 1.
        tours: { $push: '$name' }, // Iremos agregando el nombre de cada documento, como un array
      },
    },
    {
      $addFields: { month: '$_id' }, // le damos valor al mes conforme a nuestro ID.
    },
    {
      $project: {
        _id: 0, // Le damos a cada uno de los nombres de campo un cero o un uno, no aparecera la identificacion.
      },
    },
    {
      $sort: { numTourStarts: -1 }, // Ordenamos de menor a mayor por el que tenga mas meses.
    },
    {
      $limit: 12, // Traemos solo los primeros 12 elementos
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
