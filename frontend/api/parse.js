import { parseFile } from './_services/fileParser.service.js';
import { parseWithGroq } from './_services/groq.service.js';
import { validateRoadmapJSON } from './_services/validator.service.js';
import { assembleRoadmap } from './_services/roadmap.service.js';
import { logger } from './_utils/logger.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed' } });
  }

  try {
    logger.log('POST /api/parse - serverless handler');

    const { fileBase64, mimeType, fileName, rawText, courseTitle, totalWeeks } = req.body;

    let extractedText = rawText;

    if (fileBase64) {
      logger.log(`Decoding and parsing file: ${fileName}`);
      const buffer = Buffer.from(fileBase64, 'base64');
      const file = { buffer, mimetype: mimeType || 'application/pdf', originalname: fileName };
      extractedText = await parseFile(file);
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_INPUT', message: 'Please provide a file or syllabus text.' }
      });
    }

    const detectedCourseTitle = courseTitle || 'Course';
    const detectedTotalWeeks = totalWeeks ? parseInt(totalWeeks) : 8;

    logger.log(`Course: ${detectedCourseTitle}, Weeks: ${detectedTotalWeeks}`);

    const aiResponse = await parseWithGroq(detectedCourseTitle, detectedTotalWeeks, extractedText);
    const validatedRoadmap = validateRoadmapJSON(aiResponse);
    const finalRoadmap = assembleRoadmap(validatedRoadmap);

    logger.log(`Parse successful! Roadmap ID: ${finalRoadmap.id}`);
    res.status(200).json({ success: true, data: finalRoadmap });
  } catch (error) {
    logger.error('Parse handler error', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.errorCode || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
      }
    });
  }
}
