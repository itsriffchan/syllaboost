import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import { ERROR_CODES } from '../utils/constants.js';

/**
 * Gemini API service
 * Handles all communication with Google Gemini API
 */

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

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

/**
 * Build the user prompt for Gemini
 * @param {string} courseTitle - Course title (detected or user-provided)
 * @param {number} totalWeeks - Total weeks in the course
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
}`;
};

/**
 * Call Gemini API to parse syllabus and generate roadmap
 * @param {string} courseTitle - Course title
 * @param {number} totalWeeks - Total weeks
 * @param {string} rawText - Extracted syllabus text
 * @returns {Promise<Object>} - Parsed roadmap JSON from Gemini
 * @throws {Object} - Error object with errorCode and statusCode
 */
export const parseWithGemini = async (courseTitle, totalWeeks, rawText) => {
  try {
    logger.log('Calling Gemini API for syllabus parsing');

    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      systemInstruction: SYSTEM_PROMPT,
    });

    const userPrompt = buildUserPrompt(courseTitle, totalWeeks, rawText);

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.3,
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 4096,
      },
    });

    // Extract the text response
    if (!response.response.candidates || response.response.candidates.length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    const content = response.response.candidates[0].content;
    if (!content.parts || content.parts.length === 0) {
      throw new Error('No content in Gemini response');
    }

    const responseText = content.parts[0].text;
    logger.log('Gemini API response received, parsing JSON');

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('Failed to parse Gemini response as JSON', parseError);
      const err = new Error('Gemini API returned unparseable response');
      err.errorCode = ERROR_CODES.AI_PARSE_FAILED;
      err.statusCode = 422;
      throw err;
    }

    return parsedResponse;
  } catch (error) {
    // Check if it's already a custom error
    if (error.errorCode) {
      throw error;
    }

    logger.error('Gemini API call failed', error);
    const err = new Error('Failed to call Gemini API');
    err.errorCode = ERROR_CODES.AI_API_ERROR;
    err.statusCode = 500;
    throw err;
  }
};
