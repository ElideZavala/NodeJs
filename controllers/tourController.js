const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // BUILD QUERY
    // 1) Filering
    const queryObj = { ...req.query }; // desestruracion de los datos
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // console.log(req.query, queryObj); // Las peticiones que se realizaron en postman

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj); // Devolvera una consulta hecha en nuestro postman
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // hacer concidir con estas palabras (g)= sucedera varias veces. remplazara a estos valors solo para que tengan el signo $, ejemplp ($gte)
    console.log(JSON.parse(queryStr));

    //Busqueda de Elementos
    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    const query = Tour.find(queryObj);

    //EXECUTE QUERY
    const tours = await query;

    // SEMD RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
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
