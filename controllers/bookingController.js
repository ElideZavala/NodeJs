const stripe = require('stripe');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getChekoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  stripe.checkout.session.create({
    payment_method_types: ['card'], // Metodo aceptado
    success_url: `${req.protocol}://${req.get('host')}/`, // pagina ala que sera direcionado nuestro usuario.
    calcel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // ( pagina a la que el usuario decide cancelar el pago )
    customer_email: req.user.email, // Especificar el correo del CLIENTE, es decir de nuestro usuario.
    client_reference_id: req.params.tourId, // tomamos una referencia al tour comprado del cliente.
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [``],
      },
    ],
  });
  // 3)  Create session as response
});
