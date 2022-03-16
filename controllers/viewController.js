// render renderizará la plantilla pug
// Express buscara este archivo dentro de la carpeta que se especifico al principio.
const Tour = require('../models/tourModel');
// const Review = require('../models/reviewModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Buid template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  // Vamos a buscar por un tour y luego vamos a incluir a reviews como path
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews', // ?
    fields: 'review rating user', // Obtenemos estos campos.
  });

  //    const reviews = await Review.findOne();
  //    const users = await User.findOne();
  // 2) Build template

  // 3) Render template using data form

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});
