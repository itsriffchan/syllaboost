import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { logger } from '../_utils/logger.js';
import { ERROR_CODES } from '../_utils/constants.js';
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
