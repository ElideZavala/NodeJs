const express = require('express');

//Importamos tourController.js
const {
  checkID,
  getAllTours,
  createTour,
  checkBody,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
const router = express.Router();

router.param('id', checkID);

router.route('/').get(getAllTours).post(checkBody, createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router; // Realizamos la exportacion de Router
