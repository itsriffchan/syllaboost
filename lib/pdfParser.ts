/**
 * Optimized PDF Parser for FEUTECH Syllabi
 * Extracts course modules/weeks from FEUTECH's structured table format
 * Focuses on MODULE content, learning outcomes, and teaching activities
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
  title: string; // e.g., "MODULE 1: INTRODUCTION TO PHP"
  topics: string[];
  learningOutcomes?: string[];
  teachingActivities?: string[];
  assessmentTasks?: string[];
}

/**
 * Intelligently extracts structured course information from FEUTECH PDF text
 * FEUTECH uses a table format with MODULE entries
 */
export function parseSyllabusText(fullText: string): ParsedSyllabus {
  // Normalize text - remove extra whitespace but preserve structure
  const text = fullText.replace(/\f/g, '\n'); // Remove form feeds
  const lines = text.split('\n');

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

  // Extract modules/weeks from FEUTECH table format
  parsed.weeks = extractFEUTECHModules(lines);
  parsed.totalWeeks = parsed.weeks.length;

  return parsed;
}

/**
 * Extract course name from the beginning of the document
 */
function extractCourseName(lines: string[]): string {
  // Look for explicit COURSE TITLE pattern
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const line = lines[i].trim();
    const lineUpper = line.toUpperCase();
    
    // Look for "COURSE TITLE" or just the course name line
    if (lineUpper.includes('COURSE TITLE') || lineUpper.includes('APPLICATION DEVELOPMENT')) {
      // Collect the course name from this line and following lines
      let courseName = '';
      
      // If COURSE TITLE is in the line, get everything after it
      if (lineUpper.includes('COURSE TITLE')) {
        const match = line.match(/COURSE\s+TITLE\s+(.+)/i);
        if (match) {
          courseName = match[1].trim();
        }
      }
      
      // If we didn't get it, check the next few lines
      if (!courseName) {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const candidate = lines[j].trim();
          
          // Skip empty lines and metadata
          if (!candidate || candidate.match(/^\d+\s+UNITS?|^PREREQUISITE|^COURSE CODE|^UNITS\s*\/|^2\s+UNITS/i)) {
            continue;
          }
          
          // Look for the actual course name (usually has "AND" or "WITH" or multiple capital words)
          if (candidate.length > 10 && candidate.length < 300 && /[A-Z]/.test(candidate)) {
            courseName = candidate;
            break;
          }
        }
      }
      
      if (courseName) {
        // Clean up the course name
        courseName = courseName
          .replace(/\s+/g, ' ')
          .replace(/\(LAB\)|\(LEC\)/i, '') // Remove (LAB) or (LEC) designation
          .trim();
        
        if (courseName.length > 5) {
          return courseName;
        }
      }
    }
  }
  
  return 'Untitled Course';
}

/**
 * Extract course code (e.g., CCS0043L)
 */
function extractCourseCode(lines: string[]): string | undefined {
  // Look for COURSE CODE header first
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const lineUpper = lines[i].toUpperCase();
    
    if (lineUpper.includes('COURSE CODE')) {
      // Code is usually in the same line or next line
      const match = lines[i].match(/COURSE\s+CODE[\s:]*([A-Z0-9]{6,10})/i);
      if (match) return match[1];
      
      // Check next line
      if (i + 1 < lines.length) {
        const nextMatch = lines[i + 1].match(/^([A-Z]{2,4}\d{4}[A-Z]?)/);
        if (nextMatch) return nextMatch[1];
      }
    }
  }
  
  // Fallback: look for course code pattern anywhere in first 30 lines
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const match = lines[i].match(/\b([A-Z]{2,4}\d{4}[A-Z]?)\b/);
    if (match && match[1].length >= 6) {
      return match[1];
    }
  }
  
  return undefined;
}

/**
 * Extract course credits
 */
function extractCredits(lines: string[]): number | undefined {
  for (const line of lines.slice(0, 30)) {
    const match = line.match(/(?:units?|credits?)[\s:]*(\d+)/i);
    if (match) return parseInt(match[1]);
  }
  return undefined;
}

/**
 * Extract course description
 */
function extractCourseDescription(lines: string[]): string {
  // Look for COURSE DESCRIPTION section
  let descStart = -1;
  
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const lineUpper = lines[i].toUpperCase();
    
    // Match "COURSE DESCRIPTION" even if split across lines
    if (lineUpper.includes('COURSE') && lineUpper.includes('DESCRIPTION')) {
      descStart = i + 1;
      break;
    }
    
    // Also check if description content starts (usually after COURSE CODE/TITLE)
    if (i > 5 && !descStart && lineUpper.includes('COURSE') && !lineUpper.includes('CODE') && !lineUpper.includes('TITLE')) {
      descStart = i;
      break;
    }
  }

  if (descStart === -1) {
    descStart = Math.min(15, lines.length);
  }

  // Collect lines until we hit another section header
  let description = '';
  let lineCount = 0;
  
  for (let i = descStart; i < Math.min(descStart + 8, lines.length); i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Stop if we hit major sections
    if (line.match(/^(INSTITUTION|DEPARTMENT|PROGRAM|EDUCATIONAL|VISION|MODULE|WEEK|GRADE|PREREQUISITE)/i)) {
      break;
    }
    
    // Only add substantive content
    if (line.length > 10 && !line.match(/^[A-Z\s]{0,5}$/)) {
      description += line + ' ';
      lineCount++;
      if (lineCount >= 3) break; // Usually 2-3 lines for description
    }
  }

  const result = description
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 500);
  
  return result || 'Course content and learning objectives are detailed in the curriculum timeline above.';
}

/**
 * Extract modules from FEUTECH table format
 * Looks for patterns like "MODULE 1:", "MODULE 2 –", etc.
 * And time indicators like "1 / 1.33 hrs", "2 / 2.67 hrs"
 */
function extractFEUTECHModules(lines: string[]): WeekInfo[] {
  const weeks: WeekInfo[] = [];
  let moduleCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, administrative sections
    if (!line || 
        line.match(/^(GRADING|ASSESSMENT CRITERIA|INSTRUCTIONAL|TEXTBOOK|REFERENCES|VISION|MISSION|EDUCATIONAL|PROGRAM|GRADUATE|PREREQUISITE|INSTITUTION|DEPARTMENT)/i) ||
        line.match(/^(CLO|LONG EXAMINATION|FINAL EXAMINATION|COURSE OUTCOMES|COURSE CODE|COURSE TITLE|UNITS)/i)) {
      continue;
    }

    // Detect MODULE X or COURSE ORIENTATION or MIDTERM/FINAL EXAM
    let moduleMatch = line.match(/^MODULE\s+(\d+)\s*[:–\-]?\s*(.+)/i);
    let courseOrienMatch = line.match(/^(COURSE ORIENTATION|MIDTERM|FINAL EXAMINATION?)/i);
    let longExamMatch = line.match(/^LONG EXAMINATION\s+(\d+)/i);

    if (moduleMatch) {
      const moduleNum = parseInt(moduleMatch[1]);
      const moduleTitle = moduleMatch[2].trim();
      
      moduleCount++;
      
      // Extract module content (topics, subtopics)
      const topics = extractModuleTopics(lines, i);
      const outcomes = extractModuleOutcomes(lines, i);
      const activities = extractTeachingActivities(lines, i);
      const assessments = extractAssessmentTasks(lines, i);

      if (topics.length > 0 || outcomes.length > 0) {
        weeks.push({
          weekNumber: moduleNum,
          title: `MODULE ${moduleNum}: ${moduleTitle}`,
          topics: topics,
          learningOutcomes: outcomes,
          teachingActivities: activities,
          assessmentTasks: assessments,
        });
      }
    } else if (courseOrienMatch && !weeks.some(w => w.title.includes('ORIENTATION'))) {
      // Add course orientation as week 0
      const topics = extractModuleTopics(lines, i);
      weeks.unshift({
        weekNumber: 0,
        title: 'COURSE ORIENTATION',
        topics: topics.length > 0 ? topics : ['Course outline review', 'Syllabus discussion', 'Course policies'],
        learningOutcomes: [],
        teachingActivities: [],
        assessmentTasks: [],
      });
    }
  }

  return weeks;
}

/**
 * Extract topics from a MODULE section
 * Looks for bullet points, subtopic headers, and content
 */
function extractModuleTopics(lines: string[], startIdx: number): string[] {
  const topics: string[] = [];
  let i = startIdx + 1;
  let stopAtIndex = Math.min(startIdx + 30, lines.length);

  // Find where this module's content ends (next MODULE or section)
  for (let j = startIdx + 1; j < Math.min(startIdx + 40, lines.length); j++) {
    const line = lines[j].trim();
    if (line.match(/^MODULE\s+\d+|^LONG EXAMINATION|^MIDTERM|^FINAL/) && j > startIdx + 2) {
      stopAtIndex = j;
      break;
    }
  }

  // Extract topics from content
  while (i < stopAtIndex && topics.length < 15) {
    const line = lines[i].trim();

    // Look for SUBTOPIC headers and bullet points
    if (line.match(/^SUBTOPIC\s+\d+|^[-•*]\s+/i)) {
      const cleanLine = line
        .replace(/^SUBTOPIC\s+\d+\s*[:–\-]?\s*/i, '')
        .replace(/^[-•*]\s*/i, '')
        .trim();

      if (cleanLine && cleanLine.length > 3 && cleanLine.length < 200) {
        // Avoid adding section headers
        if (!cleanLine.match(/^(INTENDED|DETAILED|TEACHING|ASSESSMENT|CLO|WEEK)/i)) {
          topics.push(cleanLine);
        }
      }
    }

    i++;
  }

  return topics;
}

/**
 * Extract intended learning outcomes from ILO column
 */
function extractModuleOutcomes(lines: string[], startIdx: number): string[] {
  const outcomes: string[] = [];
  let i = startIdx;
  
  // Look backwards or forwards for ILO section
  for (let j = Math.max(0, startIdx - 5); j < Math.min(startIdx + 15, lines.length); j++) {
    const line = lines[j].trim();
    
    if (line.match(/^(To|Understand|Know|Learn|Explain|Apply|Analyze|Design|Evaluate)/i)) {
      if (line.length > 5 && line.length < 200) {
        outcomes.push(line);
        if (outcomes.length >= 5) break;
      }
    }
  }

  return outcomes;
}

/**
 * Extract teaching and learning activities
 */
function extractTeachingActivities(lines: string[], startIdx: number): string[] {
  const activities: string[] = [];
  let i = startIdx;
  let foundLIL = false;

  // Look for "LIL:" marker and extract activities
  for (let j = startIdx; j < Math.min(startIdx + 25, lines.length); j++) {
    const line = lines[j].trim();
    
    if (line.includes('LIL:') || line.match(/^(Guided|Hands-on|Problem|Case|Think|Collaborative|Visualization|Error|Concept)/)) {
      foundLIL = true;
    }

    if (foundLIL) {
      // Extract activity descriptions (usually on lines starting with capital letter)
      if (line.match(/^(Guided|Hands-on|Problem|Case|Think|Collaborative|Visualization|Error|Concept|Demonstration|Scenario|Worked|Incremental|Peer|Mini|Micro|Flowchart|Debugging|Gamified|Interactive|Exploration|Micro-Projects)/i)) {
        // Clean up the line
        const activity = line
          .replace(/^[-–•*]\s*/, '')
          .trim();
        
        if (activity && activity.length > 5 && activity.length < 300) {
          activities.push(activity);
        }
        
        if (activities.length >= 8) break;
      }

      // Stop at next MODULE or assessment section
      if (line.match(/^(ASSESSMENT|MODULE\s+\d+|Formative|Lab Activity)/i) && activities.length > 0) {
        break;
      }
    }
  }

  return activities;
}

/**
 * Extract assessment tasks
 */
function extractAssessmentTasks(lines: string[], startIdx: number): string[] {
  const assessments: string[] = [];
  let foundAT = false;

  for (let j = startIdx; j < Math.min(startIdx + 30, lines.length); j++) {
    const line = lines[j].trim();
    
    if (line.includes('ASSESSMENT TASK (AT)') || line.match(/^(Formative|Lab Activity|Long Exam)/i)) {
      foundAT = true;
    }

    if (foundAT) {
      const match = line.match(/^(Formative|Lab|Long|Quiz|Practical|Project|Exam)/i);
      if (match) {
        const task = line.replace(/^[-•*]\s*/, '').trim();
        if (task && assessments.length < 4) {
          assessments.push(task);
        }
      }

      // Stop at next module
      if (line.match(/^MODULE\s+\d+/i) && assessments.length > 0) {
        break;
      }
    }
  }

  return assessments;
}

/**
 * Extract assessment/grading information
 */
function extractAssessmentInfo(lines: string[]): string | undefined {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toUpperCase().includes('GRADING SYSTEM')) {
      // Collect next 5-10 lines as assessment info
      let assessment = '';
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const line = lines[j].trim();
        if (!line || line.match(/^(INSTRUCTIONAL|TEXTBOOK|REFERENCES)/i)) break;
        if (line.match(/^(Lecture|Lab|Class|Midterm|Final|Exam|Quiz)/i)) {
          assessment += line + ' ';
        }
      }
      return assessment.trim().substring(0, 400) || undefined;
    }
  }
  return undefined;
}

/**
 * Extract prerequisite information
 */
function extractPrerequisite(lines: string[]): string | undefined {
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    if (lines[i].toUpperCase().includes('PREREQUISITE')) {
      const match = lines[i].match(/PREREQUISITE[\s:]*(.+)/i);
      if (match) return match[1].trim().substring(0, 300);
    }
  }
  return undefined;
}

/**
 * Format the parsed syllabus into a concise string for AI processing
 * Emphasizes MODULE structure and focuses on practical content
 */
export function formatParsedSyllabusForAI(parsed: ParsedSyllabus): string {
  let formatted = '';

  formatted += `COURSE: ${parsed.courseName}\n`;
  if (parsed.courseCode) formatted += `CODE: ${parsed.courseCode}\n`;
  if (parsed.credits) formatted += `CREDITS: ${parsed.credits}\n`;
  
  formatted += `\nDESCRIPTION:\n${parsed.description}\n`;
  
  if (parsed.prerequisite) {
    formatted += `\nPREREQUISITE: ${parsed.prerequisite}\n`;
  }

  formatted += `\nTOTAL MODULES: ${parsed.totalWeeks}\n`;
  formatted += `\n${'='.repeat(70)}\nMODULE BREAKDOWN\n${'='.repeat(70)}\n`;

  // Format module content concisely
  for (const week of parsed.weeks) {
    formatted += `\n${week.title}\n`;
    formatted += `${'─'.repeat(70)}\n`;
    
    if (week.topics.length > 0) {
      formatted += `Topics: ${week.topics.join(' | ')}\n`;
    }
    
    if (week.learningOutcomes && week.learningOutcomes.length > 0) {
      formatted += `Learning Outcomes: ${week.learningOutcomes.slice(0, 3).join('; ')}\n`;
    }
    
    if (week.teachingActivities && week.teachingActivities.length > 0) {
      formatted += `Teaching Activities: ${week.teachingActivities.slice(0, 3).join('; ')}\n`;
    }
    
    if (week.assessmentTasks && week.assessmentTasks.length > 0) {
      formatted += `Assessment: ${week.assessmentTasks.join('; ')}\n`;
    }
  }

  if (parsed.assessmentInfo) {
    formatted += `\n${'='.repeat(70)}\nGRADING CRITERIA\n`;
    formatted += `${parsed.assessmentInfo}\n`;
  }

  return formatted;
}
