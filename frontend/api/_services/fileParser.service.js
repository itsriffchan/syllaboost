import mammoth from 'mammoth';
import { logger } from '../_utils/logger.js';
import { ERROR_CODES } from '../_utils/constants.js';

export const parsePDF = async (fileBuffer) => {
  try {
    logger.log('Parsing PDF file');
    
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('File buffer is empty');
    }
    
    logger.log(`Received buffer of size: ${fileBuffer.length} bytes`);
    
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    logger.log(`pdf-parse module loaded, type: ${typeof pdfParse}`);
    
    if (typeof pdfParse !== 'function') {
      throw new Error(`pdf-parse is not a function, got: ${typeof pdfParse}`);
    }

    const pdfData = await pdfParse(fileBuffer);
    logger.log(`PDF data: ${JSON.stringify({pages: pdfData.numpages, textLength: pdfData.text?.length})}`);
    
    const text = pdfData.text || '';
    
    if (!text || text.trim().length === 0) {
      logger.warn('PDF parsed but contains no extractable text (may be image-based PDF)');
      throw new Error('No text content extracted from PDF - file may be image-based');
    }

    logger.log(`PDF parsed successfully, extracted ${text.length} characters`);
    return text;
  } catch (error) {
    logger.error('PDF parsing failed', { message: error.message, stack: error.stack });
    const err = new Error(`Could not extract text from PDF file: ${error.message}`);
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
