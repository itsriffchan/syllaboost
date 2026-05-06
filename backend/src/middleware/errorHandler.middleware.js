import { logger } from '../utils/logger.js';
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from '../utils/constants.js';

/**
 * Global error handler middleware
 * Must be the last middleware in the express app
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error caught by global handler', err);

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: ERROR_CODES.FILE_TOO_LARGE,
          message: ERROR_MESSAGES.FILE_TOO_LARGE,
          field: 'file',
        },
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_FILE_TYPE,
          message: ERROR_MESSAGES.INVALID_FILE_TYPE,
          field: 'file',
        },
      });
    }
  }

  // Custom errors with error codes
  if (err.errorCode) {
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message || ERROR_MESSAGES[err.errorCode] || ERROR_MESSAGES.INTERNAL_ERROR,
        field: err.field || null,
      },
    });
  }

  // Generic errors
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    },
  });
};
