export const ERROR_CODES = {
  MISSING_INPUT: 'MISSING_INPUT',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  TEXT_TOO_SHORT: 'TEXT_TOO_SHORT',
  PARSE_FAILED: 'PARSE_FAILED',
  AI_PARSE_FAILED: 'AI_PARSE_FAILED',
  AI_API_ERROR: 'AI_API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};

export const ERROR_MESSAGES = {
  MISSING_INPUT: 'Please upload a file or paste your syllabus text.',
  INVALID_FILE_TYPE: 'Only PDF and Word (.docx) files are accepted.',
  FILE_TOO_LARGE: 'Your file is too large. Please upload a file under 10MB.',
  TEXT_TOO_SHORT: 'Your syllabus text is too short. Please paste more content.',
  PARSE_FAILED: 'We couldn\'t read your file. Try saving it as PDF and re-uploading.',
  AI_PARSE_FAILED: 'Something went wrong generating your roadmap. Please try again.',
  AI_API_ERROR: 'Our AI service is temporarily unavailable. Please try again in a moment.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};

export const LIMITS = {
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
  MIN_TEXT_LENGTH: 100,
  MAX_WEEKS: 52,
  MIN_WEEKS: 1,
  PROJECTS_PER_WEEK: 2, // 1 starter + 1 stretch
};

export const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.docx'];

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};
