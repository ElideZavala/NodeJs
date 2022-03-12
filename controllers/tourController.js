const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// Get All Tour
exports.getAllTours = factory.getAll(Tour);
// Get Tour.
exports.getTour = factory.getOne(Tour, { path: 'reviews' }); // Propiedad de la ruta sera reviews y select el cual especificamos cual de los campos queremos obtener, en dado casos.
// Create Tour.
exports.createTour = factory.createOne(Tour);
// Actualiza Tour.
exports.updateTour = factory.updateOne(Tour);
// Delete Tour.
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // coincidir elementos con rangos mayor a un promedio de 4.5.
    },
    {
      // Objetos dentro de objetos, llamado grupo
      $group: {
        _id: { $toUpper: '$difficulty' }, //  Especificar por alguna otra caracteristica.// se vera en MAYUSCULA
        numTours: { $sum: 1 }, // sumaremos el numero total de documentos.
        numRatings: { $sum: '$ratingsAverage ' }, //suma de las calificaciones
        avgRating: { $avg: '$ratingsQuantity' }, // Calcularemos el promedio de los promedios.
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

// distancia/ centro/ longitud y latitud/ unidad de barra/ parametro de consultas.
// tours-within?distance=233&center=-40,45&unit=mi
// tour-within/233/center/33.92671721939491, -118.02108560974635,/unit/mi

exports.getToursWithin = (req, res, next) => {
  const { distance, center, unit } = req.params;
  const [lat, lng] = latlng.split(','); // lo dividimos por coma.

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitut and longitude in the format lat, lng.',
        400
      )
    );
  }

  console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
  });
};
