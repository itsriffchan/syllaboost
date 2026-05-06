import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * Roadmap assembly service
 * Adds backend-generated fields (IDs, timestamps) to validated data
 */

/**
 * Assemble final Roadmap object
 * Adds UUID for roadmap and for each project
 * @param {Object} validatedData - Roadmap data from validator
 * @returns {Object} - Complete Roadmap object ready for storage/response
 */
export const assembleRoadmap = (validatedData) => {
  logger.log('Assembling final roadmap object');

  const roadmapId = uuidv4();
  const generatedAt = new Date().toISOString();

  // Add UUIDs to all projects
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

/**
 * Store roadmap in session
 * @param {Object} session - Express session object
 * @param {Object} roadmap - Complete roadmap object
 */
export const storeInSession = (session, roadmap) => {
  if (!session.roadmaps) {
    session.roadmaps = {};
  }
  session.roadmaps[roadmap.id] = roadmap;
  logger.log(`Roadmap stored in session with ID: ${roadmap.id}`);
};

/**
 * Retrieve roadmap from session by ID
 * @param {Object} session - Express session object
 * @param {string} roadmapId - Roadmap ID to retrieve
 * @returns {Object|null} - Roadmap object or null if not found
 */
export const retrieveFromSession = (session, roadmapId) => {
  if (!session.roadmaps || !session.roadmaps[roadmapId]) {
    logger.warn(`Roadmap not found in session: ${roadmapId}`);
    return null;
  }
  logger.log(`Roadmap retrieved from session: ${roadmapId}`);
  return session.roadmaps[roadmapId];
};
