import { logger } from '../utils/logger.js';
import { ERROR_CODES } from '../utils/constants.js';

/**
 * File parser service
 * Handles extraction of text from PDF and DOCX files
 */

/**
 * Parse PDF file and extract text
 * @param {Buffer} fileBuffer - The PDF file buffer from multer
 * @returns {Promise<string>} - Extracted text content
 * @throws {Object} - Error object with errorCode and statusCode
 */
export const parsePDF = async (fileBuffer) => {
  try {
    logger.log('Parsing PDF file');
    // Implementation to be added - using pdf-parse
    throw new Error('PDF parsing not yet implemented');
  } catch (error) {
    logger.error('PDF parsing failed', error);
    const err = new Error('Could not extract text from PDF file');
    err.errorCode = ERROR_CODES.PARSE_FAILED;
    err.statusCode = 422;
    throw err;
  }
};

/**
 * Parse DOCX file and extract text
 * @param {Buffer} fileBuffer - The DOCX file buffer from multer
 * @returns {Promise<string>} - Extracted text content
 * @throws {Object} - Error object with errorCode and statusCode
 */
export const parseDOCX = async (fileBuffer) => {
  try {
    logger.log('Parsing DOCX file');
    // Implementation to be added - using mammoth
    throw new Error('DOCX parsing not yet implemented');
  } catch (error) {
    logger.error('DOCX parsing failed', error);
    const err = new Error('Could not extract text from DOCX file');
    err.errorCode = ERROR_CODES.PARSE_FAILED;
    err.statusCode = 422;
    throw err;
  }
};

/**
 * Determine file type and parse accordingly
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Extracted text content
 * @throws {Object} - Error object with errorCode and statusCode
 */
export const parseFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const mimeType = file.mimetype.toLowerCase();

  if (mimeType === 'application/pdf') {
    return parsePDF(file.buffer);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseDOCX(file.buffer);
  } else {
    const err = new Error('Invalid file type');
    err.errorCode = ERROR_CODES.INVALID_FILE_TYPE;
    err.statusCode = 400;
    throw err;
  }
};
