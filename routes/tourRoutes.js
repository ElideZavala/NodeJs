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
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
// const { createReview } = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', checkID);

//POST/ tour/234fad/review <- EstaRuta anidada significa acceder al recurso de reseñas en el recurso del recorrido
//GET/ tour/234fad/review <- Nos proporcionara todas las reseñas de esta gira.
//GET/ tour/234fad/review/4564697jf <- Especificar el ID de la revisión. Obtenemos una revisión  con este ID.

// Este enrutador de recorrido deberia usar el enrutador de revision.
router.use('/:tourId/reviews', reviewRouter); // Para esta ruta especifica queremos

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

// distancia/ centro/ longitud y latitud/ unidad de barra/ parametro de consultas.
// tours-within?distance=233&center=-40,45&unit=mi
// tour-within/233/center/-40,45/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour); // admin => roles de usuarios autorizados para eliminar el tour.

module.exports = router; // Realizamos la exportacion de Router
