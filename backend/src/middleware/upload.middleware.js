import multer from 'multer';
import { logger } from '../utils/logger.js';
import { LIMITS, ACCEPTED_FILE_TYPES, ERROR_CODES } from '../utils/constants.js';

// Use memory storage - no disk writes for v1.0
const storage = multer.memoryStorage();

// File filter for accepted types
const fileFilter = (req, file, cb) => {
  if (ACCEPTED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
  },
});

/**
 * Upload middleware for handling file uploads
 * Expects either 'file' field (for PDF/DOCX) or 'rawText' field
 */
export const uploadMiddleware = upload.single('file');

/**
 * Validation middleware for upload data
 * Ensures either file OR rawText is provided, with proper validation
 */
export const validateUploadData = (req, res, next) => {
  const { rawText, courseTitle, totalWeeks } = req.body;
  const file = req.file;

  // Check: either file OR rawText must be provided
  if (!file && !rawText) {
    logger.warn('Upload validation failed: no file or rawText provided');
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.MISSING_INPUT,
        message: 'Please upload a file or paste your syllabus text.',
        field: 'file',
      },
    });
  }

  // Validate file size if provided
  if (file && file.size > LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
    logger.warn(`File too large: ${file.size} bytes`);
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.FILE_TOO_LARGE,
        message: `Your file is too large. Please upload a file under ${LIMITS.MAX_FILE_SIZE_MB}MB.`,
        field: 'file',
      },
    });
  }

  // Validate rawText length if provided
  if (rawText && rawText.length < LIMITS.MIN_TEXT_LENGTH) {
    logger.warn(`Text too short: ${rawText.length} characters`);
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.TEXT_TOO_SHORT,
        message: 'Your syllabus text is too short. Please paste more content.',
        field: 'rawText',
      },
    });
  }

  // Validate totalWeeks if provided
  if (totalWeeks) {
    const weeks = parseInt(totalWeeks);
    if (isNaN(weeks) || weeks < LIMITS.MIN_WEEKS || weeks > LIMITS.MAX_WEEKS) {
      logger.warn(`Invalid totalWeeks: ${totalWeeks}`);
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.MISSING_INPUT,
          message: `Total weeks must be between ${LIMITS.MIN_WEEKS} and ${LIMITS.MAX_WEEKS}.`,
          field: 'totalWeeks',
        },
      });
    }
  }

  next();
};
