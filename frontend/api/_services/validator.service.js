import { z } from 'zod';
<<<<<<< HEAD
import { logger } from '../utils/logger.js';
import { ERROR_CODES, LIMITS } from '../utils/constants.js';

/**
 * Zod schemas for runtime validation of roadmap data
 */
=======
import { logger } from '../_utils/logger.js';
import { ERROR_CODES, LIMITS } from '../_utils/constants.js';
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b

const ProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  difficulty: z.enum(['starter', 'stretch']),
  skillsUsed: z.array(z.string()).min(1),
  estimatedHours: z.number().min(1).max(8).int(),
  deliverable: z.string().min(10),
  hints: z.array(z.string()).min(2).max(3),
});

const WeekModuleSchema = z.object({
  weekNumber: z.number().min(1),
  weekLabel: z.string(),
  topics: z.array(z.string()).min(1),
  learningOutcomes: z.array(z.string()).min(1),
  projects: z.array(ProjectSchema).length(LIMITS.PROJECTS_PER_WEEK),
});

const RoadmapResponseSchema = z.object({
  courseTitle: z.string(),
  totalWeeks: z.number().min(LIMITS.MIN_WEEKS).max(LIMITS.MAX_WEEKS),
  weeks: z.array(WeekModuleSchema).min(1),
});

<<<<<<< HEAD
/**
 * Validate raw Gemini response JSON
 * @param {Object} data - Parsed JSON from Gemini API
 * @returns {Object} - Validated roadmap data
 * @throws {Object} - Error object with errorCode
 */
=======
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
export const validateRoadmapJSON = (data) => {
  try {
    logger.log('Validating roadmap JSON structure');
    const validated = RoadmapResponseSchema.parse(data);
    logger.log('Roadmap validation passed');
    return validated;
  } catch (error) {
    logger.error('Roadmap validation failed', error);
    const err = new Error('Invalid roadmap structure from AI');
    err.errorCode = ERROR_CODES.AI_PARSE_FAILED;
    err.statusCode = 422;
    throw err;
  }
};
<<<<<<< HEAD

/**
 * Validate entire Roadmap object (including backend-added fields)
 * @param {Object} roadmap - Complete roadmap object with id and generatedAt
 * @returns {boolean} - True if valid
 * @throws {Object} - Error object with errorCode
 */
export const validateCompleteRoadmap = (roadmap) => {
  try {
    if (!roadmap.id || !roadmap.generatedAt || !roadmap.courseTitle || !roadmap.totalWeeks || !roadmap.weeks) {
      throw new Error('Missing required roadmap fields');
    }
    // Validate weeks array
    if (!Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) {
      throw new Error('Weeks array invalid or empty');
    }
    logger.log('Complete roadmap validation passed');
    return true;
  } catch (error) {
    logger.error('Complete roadmap validation failed', error);
    const err = new Error('Invalid complete roadmap structure');
    err.errorCode = ERROR_CODES.AI_PARSE_FAILED;
    err.statusCode = 422;
    throw err;
  }
};
=======
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b
