import { parseFile } from './services/fileParser.service.js';
import { parseWithGroq } from './services/groq.service.js';
import { validateRoadmapJSON } from './services/validator.service.js';
import { assembleRoadmap } from './services/roadmap.service.js';
import { logger } from './utils/logger.js';

export default async function handler(req, res) {
  // Setup CORS just in case
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed' } });
  }

  try {
    logger.log('POST /api/parse - starting syllabus parsing via serverless');

    // Vercel auto-parses JSON body into req.body
    const { fileBase64, mimeType, fileName, rawText, courseTitle, totalWeeks } = req.body;

    let extractedText = rawText;

    // Step 1: Decode Base64 and Extract text
    if (fileBase64) {
      logger.log(`Extracting text from file: ${fileName}`);
      const buffer = Buffer.from(fileBase64, 'base64');
      // create a mock multer file object expected by parseFile
      const file = { buffer, mimetype: mimeType, originalname: fileName };
      extractedText = await parseFile(file);
    }

    // Step 2: Detect course title and total weeks
    const detectedCourseTitle = courseTitle || 'Course';
    const detectedTotalWeeks = totalWeeks ? parseInt(totalWeeks) : 8;

    logger.log(`Course: ${detectedCourseTitle}, Weeks: ${detectedTotalWeeks}`);

    // Step 3: Call Groq to parse syllabus and generate roadmap
    logger.log('Calling Groq API to parse syllabus');
    const aiResponse = await parseWithGroq(
      detectedCourseTitle,
      detectedTotalWeeks,
      extractedText
    );

    // Step 4: Validate the response structure
    logger.log('Validating roadmap JSON structure');
    const validatedRoadmap = validateRoadmapJSON(aiResponse);

    // Step 5: Assemble final roadmap with UUIDs and timestamps
    logger.log('Assembling final roadmap object');
    const finalRoadmap = assembleRoadmap(validatedRoadmap);

    // Step 6: Return success response
    logger.log(`Parse successful! Roadmap ID: ${finalRoadmap.id}`);
    res.status(200).json({
      success: true,
      data: finalRoadmap,
    });
  } catch (error) {
    logger.error('Parse route error', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.errorCode || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
      }
    });
  }
}
