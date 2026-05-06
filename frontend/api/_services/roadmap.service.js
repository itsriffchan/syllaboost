import { v4 as uuidv4 } from 'uuid';
import { logger } from '../_utils/logger.js';

export const assembleRoadmap = (validatedData) => {
  logger.log('Assembling final roadmap object');
  const roadmapId = uuidv4();
  const generatedAt = new Date().toISOString();

  const weeksWithIds = validatedData.weeks.map((week) => ({
    ...week,
    projects: week.projects.map((project) => ({
      id: uuidv4(),
      ...project,
    })),
  }));

  const roadmap = {
    id: roadmapId,
    courseTitle: validatedData.courseTitle,
    totalWeeks: validatedData.totalWeeks,
    generatedAt,
    weeks: weeksWithIds,
  };

  logger.log(`Roadmap assembled with ID: ${roadmapId}`);
  return roadmap;
};
