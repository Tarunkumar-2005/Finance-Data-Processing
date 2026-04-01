const express = require('express');
const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Analyst'), getRecords)
  .post(
    authorize('Admin'),
    [
      body('amount').isNumeric().withMessage('Amount must be a number'),
      body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      body('category').notEmpty().withMessage('Category is required'),
      validate,
    ],
    createRecord
  );

router.route('/:id')
  .put(
    authorize('Admin'),
    [
      body('amount').optional().isNumeric(),
      body('type').optional().isIn(['income', 'expense']),
      validate,
    ],
    updateRecord
  )
  .delete(authorize('Admin'), deleteRecord);

module.exports = router;
