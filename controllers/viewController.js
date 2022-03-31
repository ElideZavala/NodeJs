// render renderizará la plantilla pug
// Express buscara este archivo dentro de la carpeta que se especifico al principio.
const Tour = require('../models/tourModel');
// const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Buid template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  // Vamos a buscar por un tour y luego vamos a incluir a reviews como path
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews', // ?
    fields: 'review rating user', // Obtenemos estos campos.
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getSingupForm = catchAsync(async (req, res) => {
  res.status(200).render('singUp', {
    title: 'create your account!',
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account ',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account ',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id }); // Buscamos por el id dek usuario

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); // Seleccionara todos los recorridos que tienen una Id que esta en la matriz de tourIDs // Solo pasaremos nuestras giras.

  // iremos a una pagina donde solo apareceran los tour reservados.
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  //  Importar el modelo de usuario
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true, // Obtener lo nuevo, lo mas actual.
      runValidators: true, // Ejecutar los validares
    }
  );

  res.status(200).render('account', {
    title: 'Your account ',
    user: updateUser,
  });
});
