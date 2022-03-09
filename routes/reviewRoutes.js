const express = require('express');
const {
  getAllReviews,
  setTourUserIds,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // Cada enrutador solo tiene acceso a los parametros de sus rutas especificas. // parametro para obtener acceso a estas rutas

// Todas la rutas terminaran bdirigidas
//GET /tour/234fad/review
//POST /reviews62225ba17e3dd4104ce34a7c

router.use(protect); // Nadie podra acceder a menos que este autentificado.

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  // Solo los usuarios podran modificar los siguientes middlewere
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
