const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// Solo las imagenes sera almacenadas en el multer.
const multerStorage = multer.memoryStorage(); // La imagen se almacena como un buffer.

// Solo Podemos subir Imagenes
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    // Si el objeto empieza con image
    cb(null, true);
  } else {
    cb(new AppError('No an image! Please upload only images', 400), false); // mandamos un mensaje de error y no abra almacenamiento.
  }
};

// Opciones para multer, Especificamos el destino de imagenes.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Vamos a selecionar varios campos para las Imagenes.
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 }, // Solo vamos a aceptar una imagen con este nombre.
  { name: 'images', maxCount: 3 }, // Vamos a aceptar 3 Imagenes con este nombre.
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // Seguiremos de largo si en el buffer no se encuentra nigun campos de estos.
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`); // Guardamos este archivo con su nombre.

  // 2) Images.
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`); // Guardamos este archivo con su nombre.

      req.body.images.push(filename);
    })
  );

  next();
});

// En caso que tubieramos multiples imagenes pero que soo acepte un nombre pordemos realizarlo asi 🔽
// upload.array('images', 5); // ===> req.file
// // Solo un campo o una imagen
// upload.single('image'); // ===> req.files
//////////////////////

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); // lo dividimos por coma.

  // Los radiales se optinen por medir la distancia por el radio de la tierra.
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // convertir a millas y si no lo es a Km.

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitut and longitude in the format lat, lng.',
        400
      )
    );
  }

  // $geoWithin -> Operador matematico de localizacion, encuentra documentos dentro de una determinada geometria.
  // Primero colocamos la longitud y luego la latitud.
  // centerShpere de esfera.
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  // ('/distances/:latlng/unit/:unit'
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); // lo dividimos por coma.

  const multiplier = unit === 'mi' ? 0.000621371192237 : 0.001;

  // Mostrar Error si no tenemos una longitud y una latitud.
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitut and longitude in the format lat, lng.',
        400
      )
    );
  }

  // Agregamos nuevos elementos geoespaciales a nuestro Tour.
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // Lo multiplicamos por uno para obtener un numero.
        },
        distanceField: 'distance', // Donde se almacenaran todas las distancias calculadas.
        distanceMultiplier: multiplier, // multiplicara pra una conversion en Km o Millas.
      },
    },
    {
      $project: {
        // Projectamos la distancia y el nombre del Tour.
        distance: 1, // de menor a mayor.
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
