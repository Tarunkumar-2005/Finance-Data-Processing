const express = require('express');
const {
  getTotalIncome,
  getTotalExpenses,
  getNetBalance,
  getCategoryWise,
  getMonthlyTrends,
  getRecentTransactions,
} = require('../controllers/summaryController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All authenticated users can access summaries

router.get('/total-income', getTotalIncome);
router.get('/total-expenses', getTotalExpenses);
router.get('/net-balance', getNetBalance);
router.get('/category-wise', getCategoryWise);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/recent-transactions', getRecentTransactions);

module.exports = router;
