/**
 * Optimized PDF Parser for FEUTECH Syllabi
 * Extracts only essential course and weekly information to minimize token usage
 */

interface ParsedSyllabus {
  courseName: string;
  courseCode?: string;
  credits?: number;
  description: string;
  totalWeeks: number;
  weeks: WeekInfo[];
  assessmentInfo?: string;
  prerequisite?: string;
}

interface WeekInfo {
  weekNumber: number;
  title: string;
  topics: string[];
  learningOutcomes?: string[];
  assessments?: string[];
}

/**
 * Intelligently extracts structured course information from PDF text
 * Focuses on weekly breakdowns and core content, filtering administrative details
 */
export function parseSyllabusText(fullText: string): ParsedSyllabus {
  // Normalize text
  const text = fullText.replace(/\f/g, '\n'); // Remove form feeds
  const lines = text.split('\n').filter(line => line.trim());

  const parsed: ParsedSyllabus = {
    courseName: extractCourseName(lines),
    courseCode: extractCourseCode(lines),
    credits: extractCredits(lines),
    description: extractCourseDescription(lines),
    totalWeeks: 0,
    weeks: [],
    assessmentInfo: extractAssessmentInfo(lines),
    prerequisite: extractPrerequisite(lines),
  };

  // Extract weekly content - this is the most important part
  parsed.weeks = extractWeeklyContent(lines);
  parsed.totalWeeks = parsed.weeks.length || estimateTotalWeeks(lines);

  return parsed;
}

/**
 * Extract course name from the beginning of the document
 */
function extractCourseName(lines: string[]): string {
  // Look for common patterns in first 20 lines
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip short lines, headers, and metadata
    if (line.length < 5 || line.length > 150) continue;
    
    // Match course name patterns: usually capitalized, not all caps, not metadata
    if (/^[A-Z][a-zA-Z0-9\s:&-]+$/.test(line) && 
        !line.match(/^(COURSE|SUBJECT|TITLE|CREDITS|CODE)/i)) {
      return line;
    }
  }
  return 'Untitled Course';
}

/**
 * Extract course code (e.g., CS101, IT101)
 */
function extractCourseCode(lines: string[]): string | undefined {
  for (const line of lines.slice(0, 30)) {
    const match = line.match(/([A-Z]{2,4}\s*\d{3,4})/);
    if (match) return match[1];
  }
  return undefined;
}

/**
 * Extract course credits if available
 */
function extractCredits(lines: string[]): number | undefined {
  for (const line of lines.slice(0, 30)) {
    const match = line.match(/(?:credits?|units?)[\s:]*(\d+)/i);
    if (match) return parseInt(match[1]);
  }
  return undefined;
}

/**
 * Extract course description (usually first paragraph)
 */
function extractCourseDescription(lines: string[]): string {
  // Find description section - usually after course title, before weekly breakdown
  let descStart = -1;
  
  for (let i = 0; i < Math.min(40, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('description') || line.includes('overview') || 
        line.includes('course outline')) {
      descStart = i + 1;
      break;
    }
  }

  // If no explicit description header, use first substantial paragraph
  if (descStart === -1) {
    descStart = Math.min(5, lines.length);
  }

  // Collect lines until we hit "week", "topics", or "syllabus"
  let description = '';
  for (let i = descStart; i < Math.min(descStart + 10, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Stop if we hit weekly content
    if (line.toLowerCase().match(/^(week|topic|syllabus|course content|outline)/i)) {
      break;
    }
    
    description += line + ' ';
  }

  return description.trim().substring(0, 500); // Cap at 500 chars
}

/**
 * Extract weekly content - the core information we need
 * Looks for patterns like "Week 1", "Week 2", etc.
 */
function extractWeeklyContent(lines: string[]): WeekInfo[] {
  const weeks: WeekInfo[] = [];
  
  let currentWeek: WeekInfo | null = null;
  let weekPattern = /^week\s+(\d+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a week header
    const weekMatch = line.match(weekPattern);
    if (weekMatch) {
      // Save previous week if exists
      if (currentWeek && currentWeek.topics.length > 0) {
        weeks.push(currentWeek);
      }

      const weekNum = parseInt(weekMatch[1]);
      // Extract title from the same line or next line
      let title = line.substring(weekMatch[0].length).trim();
      if (!title && i + 1 < lines.length) {
        title = lines[i + 1].trim();
        i++; // Skip next line as we used it for title
      }

      currentWeek = {
        weekNumber: weekNum,
        title: title || `Week ${weekNum}`,
        topics: [],
        learningOutcomes: [],
        assessments: [],
      };
      continue;
    }

    // Collect content for current week
    if (currentWeek) {
      const lowerLine = line.toLowerCase();

      // Detect topic lines
      if (lowerLine.match(/^(topics?|content|focus|materials?|chapter)/i)) {
        // Collect topics from this and next lines
        let j = i + 1;
        while (j < Math.min(i + 8, lines.length)) {
          const topicLine = lines[j].trim();
          
          // Stop if we hit another section header
          if (topicLine.match(/^(learning|assessment|resources|week\s+\d+)/i)) {
            break;
          }
          
          if (topicLine && topicLine.length > 3) {
            // Clean up bullet points and numbering
            const cleanTopic = topicLine.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '');
            if (cleanTopic && currentWeek.topics.length < 8) {
              currentWeek.topics.push(cleanTopic);
            }
          }
          j++;
        }
        i = j - 1;
        continue;
      }

      // Detect learning outcomes
      if (lowerLine.match(/^(learning\s+outcomes?|objectives?|goals)/i)) {
        let j = i + 1;
        while (j < Math.min(i + 8, lines.length)) {
          const outcomeLine = lines[j].trim();
          
          if (outcomeLine.match(/^(assessment|resources|week\s+\d+|topics?)/i)) {
            break;
          }
          
          if (outcomeLine && outcomeLine.length > 3) {
            const cleanOutcome = outcomeLine.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '');
            if (cleanOutcome && currentWeek.learningOutcomes && currentWeek.learningOutcomes.length < 5) {
              currentWeek.learningOutcomes.push(cleanOutcome);
            }
          }
          j++;
        }
        i = j - 1;
        continue;
      }

      // Detect assessments
      if (lowerLine.match(/^(assessment|evaluation|activities?)/i)) {
        let j = i + 1;
        while (j < Math.min(i + 6, lines.length)) {
          const assessLine = lines[j].trim();
          
          if (assessLine.match(/^(week\s+\d+|topics?|learning)/i)) {
            break;
          }
          
          if (assessLine && assessLine.length > 3) {
            const cleanAssess = assessLine.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '');
            if (cleanAssess && currentWeek.assessments && currentWeek.assessments.length < 4) {
              currentWeek.assessments.push(cleanAssess);
            }
          }
          j++;
        }
        i = j - 1;
        continue;
      }

      // Stop collecting for this week if we hit the next week
      if (line.match(/^week\s+\d+/i)) {
        i--;
      }
    }
  }

  // Don't forget the last week
  if (currentWeek && currentWeek.topics.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Extract assessment/grading information
 */
function extractAssessmentInfo(lines: string[]): string | undefined {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().match(/^(assessment|grading|evaluation|evaluation criteria)/i)) {
      // Collect next 5 lines as assessment info
      let assessment = '';
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const line = lines[j].trim();
        if (!line || line.match(/^week/i)) break;
        assessment += line + ' ';
      }
      return assessment.trim().substring(0, 300);
    }
  }
  return undefined;
}

/**
 * Extract prerequisite information
 */
function extractPrerequisite(lines: string[]): string | undefined {
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    if (lines[i].toLowerCase().match(/^(prerequisite|pre-requisite|required before)/i)) {
      const match = lines[i].match(/prerequisite[s]?[\s:]*(.+)/i);
      if (match) return match[1].trim();
    }
  }
  return undefined;
}

/**
 * Estimate total weeks if not explicitly found
 */
function estimateTotalWeeks(lines: string[]): number {
  const weekNumbers = new Set<number>();
  
  for (const line of lines) {
    const match = line.match(/week\s+(\d+)/i);
    if (match) {
      weekNumbers.add(parseInt(match[1]));
    }
  }

  if (weekNumbers.size > 0) {
    return Math.max(...Array.from(weekNumbers));
  }

  // Default to 16 weeks if not found
  return 16;
}

/**
 * Format the parsed syllabus into a concise string for AI processing
 * Eliminates unnecessary details and focuses on core content
 */
export function formatParsedSyllabusForAI(parsed: ParsedSyllabus): string {
  let formatted = '';

  formatted += `Course: ${parsed.courseName}\n`;
  if (parsed.courseCode) formatted += `Code: ${parsed.courseCode}\n`;
  if (parsed.credits) formatted += `Credits: ${parsed.credits}\n`;
  
  formatted += `\nDescription:\n${parsed.description}\n`;
  
  if (parsed.prerequisite) {
    formatted += `\nPrerequisite: ${parsed.prerequisite}\n`;
  }

  formatted += `\nTotal Duration: ${parsed.totalWeeks} weeks\n`;
  formatted += `\n${'='.repeat(60)}\nWEEKLY BREAKDOWN\n${'='.repeat(60)}\n`;

  // Format weekly content concisely
  for (const week of parsed.weeks) {
    formatted += `\nWEEK ${week.weekNumber}: ${week.title}\n`;
    formatted += `Topics: ${week.topics.join(', ')}\n`;
    
    if (week.learningOutcomes && week.learningOutcomes.length > 0) {
      formatted += `Outcomes: ${week.learningOutcomes.join('; ')}\n`;
    }
    
    if (week.assessments && week.assessments.length > 0) {
      formatted += `Assessment: ${week.assessments.join('; ')}\n`;
    }
  }

  if (parsed.assessmentInfo) {
    formatted += `\n${'='.repeat(60)}\nASSESSMENT CRITERIA\n`;
    formatted += `${parsed.assessmentInfo}\n`;
  }

  return formatted;
}
