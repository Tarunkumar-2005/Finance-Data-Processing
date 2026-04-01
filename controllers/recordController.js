const FinancialRecord = require('../models/FinancialRecord');
const catchAsync = require('../utils/catchAsync');
const apiResponse = require('../utils/apiResponse');

// @desc    Create a new record
// @route   POST /api/records
// @access  Private/Admin
exports.createRecord = catchAsync(async (req, res, next) => {
  const { amount, type, category, date, notes } = req.body;

  const record = await FinancialRecord.create({
    amount,
    type,
    category,
    date,
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json(apiResponse(true, record, 'Record created successfully'));
});

// @desc    Get all records with pagination, filtering, search
// @route   GET /api/records
// @access  Private/Admin,Analyst
exports.getRecords = catchAsync(async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  // Fields to exclude from direct match
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Filtering
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  query = FinancialRecord.find(JSON.parse(queryStr)).populate('createdBy', 'name email');

  // Search by category or notes
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query = query.find({
      $or: [{ category: searchRegex }, { notes: searchRegex }],
    });
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-date');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await FinancialRecord.countDocuments(query.getFilter());

  query = query.skip(startIndex).limit(limit);

  const records = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: records.length,
    pagination,
    data: records,
    message: 'Records fetched successfully'
  });
});

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Private/Admin
exports.updateRecord = catchAsync(async (req, res, next) => {
  let record = await FinancialRecord.findById(req.params.id);

  if (!record) {
    return res.status(404).json(apiResponse(false, null, 'Record not found'));
  }

  record = await FinancialRecord.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(apiResponse(true, record, 'Record updated successfully'));
});

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private/Admin
exports.deleteRecord = catchAsync(async (req, res, next) => {
  const record = await FinancialRecord.findById(req.params.id);

  if (!record) {
    return res.status(404).json(apiResponse(false, null, 'Record not found'));
  }

  record.isDeleted = true;
  await record.save();

  res.status(200).json(apiResponse(true, {}, 'Record deleted successfully'));
});
