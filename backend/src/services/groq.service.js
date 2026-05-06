import Groq from 'groq-sdk';
import { logger } from '../utils/logger.js';
import { ERROR_CODES } from '../utils/constants.js';

/**
 * Groq API service
 * Handles all communication with Groq API for Llama 3
 */

const getClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert curriculum designer and software engineering mentor. Your job is to analyze a course syllabus and generate a structured weekly project roadmap for students. Rules you must follow strictly:
1. Return ONLY valid JSON. No explanation, no markdown, no preamble.
2. Each week must have exactly 1 starter project and 1 stretch project.
3. Projects must use ONLY skills taught up to and including that week.
4. Starter projects use only the current week's skills.
5. Stretch projects may use current + all prior weeks' skills.
6. estimatedHours must be a number between 1 and 8.
7. Each hints array must have exactly 2-3 items.
8. Do not suggest projects that require external APIs, paid services, or libraries not covered in the syllabus.
9. Keep project titles under 5 words.
10. Keep descriptions between 2-3 sentences.`;

const JSON_SCHEMA = `
Return a JSON object that matches this exact structure:
{
  "courseTitle": "string",
  "totalWeeks": number,
  "weeks": [
    {
      "weekNumber": number,
      "weekLabel": "string",
      "topics": ["string"],
      "learningOutcomes": ["string"],
      "projects": [
        {
          "title": "string",
          "description": "string",
          "difficulty": "starter" | "stretch",
          "skillsUsed": ["string"],
          "estimatedHours": number,
          "deliverable": "string",
          "hints": ["string", "string"]
        }
      ]
    }
  ]
}
`;

/**
 * Build the user prompt for Groq
 * @param {string} courseTitle - Course title
 * @param {number} totalWeeks - Total weeks
 * @param {string} rawText - Full syllabus text
 * @returns {string} - Formatted user prompt
 */
const buildUserPrompt = (courseTitle, totalWeeks, rawText) => {
  return `Analyze this course syllabus and generate a weekly project roadmap.
Course Title: ${courseTitle}
Total Weeks: ${totalWeeks}
Syllabus Content:
---
${rawText}
---
${JSON_SCHEMA}`;
};

/**
 * Call Groq API to parse syllabus and generate roadmap
 * @param {string} courseTitle - Course title
 * @param {number} totalWeeks - Total weeks
 * @param {string} rawText - Extracted syllabus text
 * @returns {Promise<Object>} - Parsed roadmap JSON from Groq
 */
export const parseWithGroq = async (courseTitle, totalWeeks, rawText) => {
  const maxRetries = 3;
  const baseDelay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.log(`Calling Groq API for syllabus parsing (Attempt ${attempt}/${maxRetries})`);

      const modelName = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
      const groq = getClient();
      const userPrompt = buildUserPrompt(courseTitle, totalWeeks, rawText);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: modelName,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '';
      logger.log('Groq API response received, parsing JSON');

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        logger.error('Failed to parse Groq response as JSON', parseError);
        const err = new Error('Groq API returned unparseable response');
        err.errorCode = ERROR_CODES.AI_PARSE_FAILED;
        err.statusCode = 422;
        throw err;
      }

      return parsedResponse;
    } catch (error) {
      if (error.errorCode === ERROR_CODES.AI_PARSE_FAILED) {
        throw error;
      }

      const isTemporaryError = 
        error.status === 429 || 
        error.status === 503 || 
        error.message?.includes('fetch failed');

      if (isTemporaryError && attempt < maxRetries) {
        const delay = baseDelay * attempt;
        logger.warn(`Groq API temporarily unavailable (${error.status}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      logger.error('Groq API call failed - Details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        attempt
      });

      const err = new Error(`Failed to call Groq API: ${error.message}`);
      err.errorCode = ERROR_CODES.AI_API_ERROR;
      err.statusCode = 500;
      throw err;
    }
  }
};
