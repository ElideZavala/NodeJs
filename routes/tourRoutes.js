const express = require('express');

//Importamos tourController.js
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');

router.param('id', tourController.checkID);

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router; // Realizamos la exportacion de Router
