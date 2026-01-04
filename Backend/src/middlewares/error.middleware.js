const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, err);
    res.status(500).json({
        success: false,
        message: err.message || "Server Error",
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;

