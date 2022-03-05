const express = require('express');
const {
  getAllReview,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('./../controllers/reviewController');

const router = express.Router();

router.route('/review').get(getAllReview).post(createReview);
router
  .route('/review/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
