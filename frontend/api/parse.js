<<<<<<< HEAD
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
=======
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
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed' } });
  }

  try {
<<<<<<< HEAD
    logger.log('POST /api/parse - starting syllabus parsing via serverless');

    // Vercel auto-parses JSON body into req.body
=======
    logger.log('POST /api/parse - serverless handler');

>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
    const { fileBase64, mimeType, fileName, rawText, courseTitle, totalWeeks } = req.body;

    let extractedText = rawText;

<<<<<<< HEAD
    // Step 1: Decode Base64 and Extract text
    if (fileBase64) {
      logger.log(`Extracting text from file: ${fileName}`);
      const buffer = Buffer.from(fileBase64, 'base64');
      // create a mock multer file object expected by parseFile
      const file = { buffer, mimetype: mimeType, originalname: fileName };
      extractedText = await parseFile(file);
    }

    // Step 2: Detect course title and total weeks
=======
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

>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
    const detectedCourseTitle = courseTitle || 'Course';
    const detectedTotalWeeks = totalWeeks ? parseInt(totalWeeks) : 8;

    logger.log(`Course: ${detectedCourseTitle}, Weeks: ${detectedTotalWeeks}`);

<<<<<<< HEAD
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
=======
    const aiResponse = await parseWithGroq(detectedCourseTitle, detectedTotalWeeks, extractedText);
    const validatedRoadmap = validateRoadmapJSON(aiResponse);
    const finalRoadmap = assembleRoadmap(validatedRoadmap);

    logger.log(`Parse successful! Roadmap ID: ${finalRoadmap.id}`);
    res.status(200).json({ success: true, data: finalRoadmap });
  } catch (error) {
    logger.error('Parse handler error', error);
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.errorCode || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
      }
    });
  }
}
