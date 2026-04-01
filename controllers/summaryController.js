const FinancialRecord = require('../models/FinancialRecord');
const catchAsync = require('../utils/catchAsync');
const apiResponse = require('../utils/apiResponse');

// @desc    Get total income
// @route   GET /api/summary/total-income
// @access  Private
exports.getTotalIncome = catchAsync(async (req, res, next) => {
  const result = await FinancialRecord.aggregate([
    { $match: { type: 'income', isDeleted: { $ne: true } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const total = result.length > 0 ? result[0].total : 0;
  res.status(200).json(apiResponse(true, { total }, 'Total income fetched successfully'));
});

// @desc    Get total expenses
// @route   GET /api/summary/total-expenses
// @access  Private
exports.getTotalExpenses = catchAsync(async (req, res, next) => {
  const result = await FinancialRecord.aggregate([
    { $match: { type: 'expense', isDeleted: { $ne: true } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const total = result.length > 0 ? result[0].total : 0;
  res.status(200).json(apiResponse(true, { total }, 'Total expenses fetched successfully'));
});

// @desc    Get net balance
// @route   GET /api/summary/net-balance
// @access  Private
exports.getNetBalance = catchAsync(async (req, res, next) => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        netBalance: { $subtract: ['$income', '$expense'] },
      },
    },
  ]);

  const netBalance = result.length > 0 ? result[0].netBalance : 0;
  res.status(200).json(apiResponse(true, { netBalance }, 'Net balance fetched successfully'));
});

// @desc    Get category wise summary
// @route   GET /api/summary/category-wise
// @access  Private
exports.getCategoryWise = catchAsync(async (req, res, next) => {
  const { type } = req.query; // optional filter
  const matchObj = { isDeleted: { $ne: true } };
  if (type) matchObj.type = type;

  const result = await FinancialRecord.aggregate([
    { $match: matchObj },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        type: { $first: '$type' }
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json(apiResponse(true, result, 'Category wise summary fetched successfully'));
});

// @desc    Get monthly trends
// @route   GET /api/summary/monthly-trends
// @access  Private
exports.getMonthlyTrends = catchAsync(async (req, res, next) => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json(apiResponse(true, result, 'Monthly trends fetched successfully'));
});

// @desc    Get recent transactions
// @route   GET /api/summary/recent-transactions
// @access  Private
exports.getRecentTransactions = catchAsync(async (req, res, next) => {
  const records = await FinancialRecord.find({ isDeleted: { $ne: true } })
    .sort('-date')
    .limit(5)
    .populate('createdBy', 'name');

  res.status(200).json(apiResponse(true, records, 'Recent transactions fetched successfully'));
});
