const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../utils/appError');

exports.getChekoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // Metodo aceptado
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`, // pagina ala que sera direcionado nuestro usuario.
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // ( pagina a la que el usuario decide cancelar el pago )
    customer_email: req.user.email, // Especificar el correo del CLIENTE, es decir de nuestro usuario.
    client_reference_id: req.params.tourId, // tomamos una referencia al tour comprado del cliente.
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd', // Tipo de moneda usada.
          unit_amount: tour.price * 100,
          // amount: tour.price * 100, // la cantidad esta dada en centabos por lo que multiplica por 100 para la moneda local.
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
        },
      },
    ],
  });
  // 3)  Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's a UNSECURE: everyone can make bookings without paying
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next(); // En caso de que no haya usuario, tour y presio, continuar a la siguiente.
//   await Booking.create({ tour, user, price }); // De nuestro modelo pasamos estos Elementos.

//   //    res.redirect(${req.protocol}://${req.get('host')}); // Redireccionamos el sitio web
//   res.redirect(req.originalUrl.split('?')[0]); // Separamos la URL por ? y seleccionamos el primer valor.
// });

const createBookingCheckot = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id; // Accedemos solo al id
  // const price = session.line_items[0].amount / 100; // lo convertimos nuevamente a dolares.
  // const price = session.amount_total / 100; // lo convertimos nuevamente a dolares.
  const { price } = await Tour.findOne({ _id: session.client_reference_id }); // lo convertimos nuevamente a dolares.
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature']; // agregamos un encabezado a esta solicitud que contiene un firma especial.

  let event;

  try {
    event = stripe.Webhook.construct_event(
      req.body,
      signature, // <-- En encabezado.
      process.env.STRIPE_WEBHOOK_SECRET // <-- Nuestra llave secreta. // Hacemos segura la peticion.
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createBookingCheckot(event.data.object); // Mandamos nuestro evento.

    res.status(200).json({ received: true }); // Colocar como recibido.
  }
};
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
