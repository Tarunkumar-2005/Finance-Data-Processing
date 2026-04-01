const apiResponse = {
  success: (res, status, data, message = 'Success') => {
    return res.status(status).json({
      success: true,
      data,
      message,
    });
  },
  error: (res, status, message, errorDetails = null) => {
    return res.status(status).json({
      success: false,
      message,
      error: errorDetails,
    });
  },
};

module.exports = apiResponse;
