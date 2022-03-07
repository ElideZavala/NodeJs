const express = require('express');
const {
  aliasTopTours,
  getAllTours,
  getTourStats,
  getMonthlyPlan,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
// const { createReview } = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// router.param('id', checkID);

//POST/ tour/234fad/review <- EstaRuta anidada significa acceder al recurso de reseñas en el recurso del recorrido
//GET/ tour/234fad/review <- Nos proporcionara todas las reseñas de esta gira.
//GET/ tour/234fad/review/4564697jf <- Especificar el ID de la revisión. Obtenemos una revisión  con este ID.

// Este enrutador de recorrido deberia usar el enrutador de revision.
router.use('/:tourId/reviews', reviewRouter); // Para esta ruta especifica queremos

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getAllTours).post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour); // admin => roles de usuarios autorizados para eliminar el tour.

module.exports = router; // Realizamos la exportacion de Router
