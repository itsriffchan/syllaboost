import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
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
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      throw new Error('No text content extracted from PDF');
    }

    logger.log(`PDF parsed successfully, extracted ${text.length} characters`);
    return text;
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
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      throw new Error('No text content extracted from DOCX');
    }

    logger.log(`DOCX parsed successfully, extracted ${text.length} characters`);
    return text;
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
    const err = new Error('No file provided');
    err.errorCode = ERROR_CODES.MISSING_INPUT;
    err.statusCode = 400;
    throw err;
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
