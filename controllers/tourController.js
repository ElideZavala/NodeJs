const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      msg: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id})

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      msg: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    // Creaacion de nuevo  objeto( Debe de contener su nuevo ID )
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    // Solicitud rechasada.
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }, // coincidir elementos con rangos mayor a un promedio de 4.5.
      },
      {
        // Objetos dentro de objetos, llamado grupo
        $group: {
          _id: { $toUpper: '$difficulty' }, //  Especificar por alguna otra caracteristica.// se vera en MAYUSCULA
          numTours: { $sum: 1 }, // sumaremos el numero total de documentos.
          numRatings: { $sum: '$ratingsQuantity' }, //suma de las calificaciones
          avgRating: { $avg: '$ratingsAverage' }, // Calcularemos el promedio de los promedios.
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
