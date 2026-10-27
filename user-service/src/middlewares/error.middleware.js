const { AppError } = require('../utils/error');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.code,
            message: err.message
        });
    }

    logger.error('UNHANDLED ERROR:', err);
    return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error'
    });
};

module.exports = errorHandler;
