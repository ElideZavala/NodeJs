const express = require('express');
const {
  getAllReview,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('./../controllers/reviewController');

const router = express.Router();

router.route('/').get(getAllReview).post(createReview);
router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
