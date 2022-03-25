const express = require('express');

const { getChekoutSession } = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// Vamos a ir hacia la ruta checkou, de damos proteccion
router.get('/checkout-session/:tourId', protect, getChekoutSession);

module.exports = router;
