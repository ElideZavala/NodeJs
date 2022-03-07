const express = require('express');
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // Cada enrutador solo tiene acceso a los parametros de sus rutas especificas. // parametro para obtener acceso a estas rutas

// Todas la rutas terminaran dirigidas
//GET /tour/234fad/review
//POST /reviews62225ba17e3dd4104ce34a7c
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
