import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { ERROR_CODES, LIMITS } from '../utils/constants.js';
import { logger } from '../_utils/logger.js';
import { ERROR_CODES, LIMITS } from '../_utils/constants.js';

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
