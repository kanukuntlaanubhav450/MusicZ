const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, err);
    return errorResponse(res, err.message || "Server Error", 500, err);
};

module.exports = errorHandler;
