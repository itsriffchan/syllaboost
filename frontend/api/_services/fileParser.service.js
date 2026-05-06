<<<<<<< HEAD
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
=======
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { logger } from '../_utils/logger.js';
import { ERROR_CODES } from '../_utils/constants.js';

>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
export const parsePDF = async (fileBuffer) => {
  try {
    logger.log('Parsing PDF file');
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;
<<<<<<< HEAD

    if (!text || text.trim().length === 0) {
      throw new Error('No text content extracted from PDF');
    }

=======
    if (!text || text.trim().length === 0) {
      throw new Error('No text content extracted from PDF');
    }
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
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

<<<<<<< HEAD
/**
 * Parse DOCX file and extract text
 * @param {Buffer} fileBuffer - The DOCX file buffer from multer
 * @returns {Promise<string>} - Extracted text content
 * @throws {Object} - Error object with errorCode and statusCode
 */
=======
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
export const parseDOCX = async (fileBuffer) => {
  try {
    logger.log('Parsing DOCX file');
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value;
<<<<<<< HEAD

    if (!text || text.trim().length === 0) {
      throw new Error('No text content extracted from DOCX');
    }

=======
    if (!text || text.trim().length === 0) {
      throw new Error('No text content extracted from DOCX');
    }
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
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

<<<<<<< HEAD
/**
 * Determine file type and parse accordingly
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Extracted text content
 * @throws {Object} - Error object with errorCode and statusCode
 */
=======
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
export const parseFile = async (file) => {
  if (!file) {
    const err = new Error('No file provided');
    err.errorCode = ERROR_CODES.MISSING_INPUT;
    err.statusCode = 400;
    throw err;
  }
<<<<<<< HEAD

  const mimeType = file.mimetype.toLowerCase();

=======
  const mimeType = file.mimetype.toLowerCase();
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
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
