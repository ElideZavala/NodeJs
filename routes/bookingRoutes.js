const express = require('express');

const {
  getChekoutSession,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBooking,
  getBooking,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect); // Aplicamos proteccion a las rutas siguientes.

// Vamos a ir hacia la ruta checkou, de damos proteccion
router.get('/checkout-session/:tourId', getChekoutSession);

router.use(restrictTo('admin', 'lead-guide')); // Restringimos el acceso a las siguientes rutas al admin & lead-guide

router.route('/').get(getAllBooking).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
