+-----------------------------------------------------------------------+
| **SYSTEM DESIGN DOCUMENT**                                            |
|                                                                       |
| **SyllabusAI**                                                        |
|                                                                       |
| Syllabus-to-Weekly-Roadmap Web Application                            |
+-----------------------------------------------------------------------+

+-----------------------------------+-----------------------------------+
| **Version**                       | **Date**                          |
|                                   |                                   |
| 1.0.0                             | May 2026                          |
+-----------------------------------+-----------------------------------+
| **Status**                        | **Audience**                      |
|                                   |                                   |
| Ready for Development             | Engineering Team                  |
+-----------------------------------+-----------------------------------+

**1. Project Overview**

**1.1 Purpose**

SyllabusAI is a web application that allows students to upload their
course syllabus (PDF or text), and automatically generates a
personalized weekly project roadmap aligned to each module or topic in
the syllabus. Instead of passively reading course materials, students
are given hands-on mini-projects to build in parallel with each week\'s
lessons.

**1.2 Problem Statement**

Students consume course content week by week but rarely apply it
immediately in a structured way. This leads to knowledge gaps, poor
retention, and portfolios with no real projects. SyllabusAI bridges the
gap between passive learning and active building.

**1.3 Core Value Proposition**

  ----------------------- ----------------------- -----------------------
  **Student Uploads       **AI Parses Weekly      **AI Suggests Projects
  Syllabus**              Topics**                Per Week**

  PDF, DOCX, or plain     Extracts topic, skills, Outputs 1-2 buildable
  text                    learning outcomes per   mini-projects per week
                          week/module             

  Drag & drop or paste    Maps to universal skill Ranked by difficulty:
  URL                     taxonomy                starter → stretch
  ----------------------- ----------------------- -----------------------

**1.4 Scope (v1.0)**

-   Upload syllabus via PDF, DOCX, or plain text paste

-   AI parses and extracts weekly/module topics

-   Generate a weekly project roadmap

-   View roadmap in a clean dashboard UI

-   Export roadmap as PDF

-   No user authentication required for v1.0 (session-based)

+-----------------------------------------------------------------------+
| **OUT OF SCOPE for v1.0**                                             |
|                                                                       |
| User accounts, course marketplace integrations (Coursera/Udemy API),  |
| progress tracking, community features, mobile app. These are planned  |
| for v2.0.                                                             |
+-----------------------------------------------------------------------+

**2. System Architecture**

**2.1 High-Level Architecture**

SyllabusAI follows a client-server architecture with a React frontend, a
Node.js/Express backend, and the Anthropic Claude API as the AI engine.
No database is required for v1.0 --- all state is session-based.

+-----------------------------------------------------------------------+
| **Architecture Pattern**                                              |
|                                                                       |
| Frontend (React + Vite) → REST API (Node.js/Express) → AI Engine      |
| (Anthropic Claude API) All syllabus parsing and project generation is |
| handled server-side via the Claude API. The frontend only handles UI  |
| state and rendering.                                                  |
+-----------------------------------------------------------------------+

**2.2 Component Breakdown**

  --------------- ---------------------------- ---------------------------------
  **Component**   **Technology**               **Responsibility**

  Frontend        React 18 + Vite + Tailwind   UI, file upload, roadmap display,
                  CSS                          export

  Backend API     Node.js 20 + Express 5       File parsing, Claude API calls,
                                               response formatting

  AI Engine       Anthropic Claude API         Syllabus parsing, topic
                  (claude-sonnet-4-20250514)   extraction, project generation

  File Parser     pdf-parse + mammoth (npm)    Extract raw text from PDF and
                                               DOCX files

  Session Store   express-session + memory     Temporary storage of parsed
                  store                        roadmap per session

  PDF Export      jsPDF (client-side)          Export roadmap to downloadable
                                               PDF
  --------------- ---------------------------- ---------------------------------

**2.3 Request Flow**

1.  User uploads syllabus file (PDF/DOCX) or pastes raw text in the
    frontend

2.  Frontend sends multipart/form-data POST to /api/parse endpoint

3.  Backend receives file, runs through file parser (pdf-parse or
    mammoth) to extract raw text

4.  Backend sends extracted text to Claude API with a structured system
    prompt

5.  Claude returns structured JSON: array of weekly modules with topics
    and suggested projects

6.  Backend validates and normalizes the JSON response

7.  Backend returns normalized roadmap JSON to frontend

8.  Frontend renders the roadmap as a week-by-week card dashboard

9.  User can export the roadmap as a PDF via client-side jsPDF

**3. Data Models**

**3.1 Core Data Structures**

All data is typed in TypeScript. These interfaces are the single source
of truth for frontend and backend. Both teams must use these exact field
names.

**3.1.1 SyllabusUpload (Frontend → Backend)**

+-----------------------------------------------------------------------+
| **Interface: SyllabusUpload**                                         |
|                                                                       |
| interface SyllabusUpload { file?: File; // PDF or DOCX file object    |
| (optional if rawText provided) rawText?: string; // Plain text paste  |
| (optional if file provided) courseTitle?: string; // Optional:        |
| user-provided course name totalWeeks?: number; // Optional: override  |
| week count (default: auto-detect) }                                   |
+-----------------------------------------------------------------------+

**3.1.2 ParsedSyllabus (Backend internal)**

+-----------------------------------------------------------------------+
| **Interface: ParsedSyllabus**                                         |
|                                                                       |
| interface ParsedSyllabus { rawText: string; // Full extracted text    |
| from file or paste courseTitle: string; // Detected or user-provided  |
| course title totalWeeks: number; // Total number of weeks/modules     |
| detected extractedAt: string; // ISO 8601 timestamp }                 |
+-----------------------------------------------------------------------+

**3.1.3 WeekModule (AI Output unit --- critical)**

+-----------------------------------------------------------------------+
| **Interface: WeekModule**                                             |
|                                                                       |
| interface WeekModule { weekNumber: number; // 1-based week index      |
| (Week 1, Week 2, \...) weekLabel: string; // e.g. \"Week 1\" or       |
| \"Module 1\" or \"Unit 1\" topics: string\[\]; // Array of topic      |
| strings taught this week learningOutcomes: string\[\]; // What        |
| student should know by end of week projects: Project\[\]; // Array of |
| suggested projects (1-2 per week) }                                   |
+-----------------------------------------------------------------------+

**3.1.4 Project (AI Output unit --- critical)**

+-----------------------------------------------------------------------+
| **Interface: Project**                                                |
|                                                                       |
| interface Project { id: string; // UUID v4 generated by backend       |
| title: string; // Short project name e.g. \"Temperature Converter\"   |
| description: string; // 2-3 sentence explanation of what to build     |
| difficulty: \"starter\" \| \"stretch\"; // starter = uses only this   |
| week\'s skills // stretch = uses this week + prior weeks skillsUsed:  |
| string\[\]; // Skills from THIS week\'s topics that are applied       |
| estimatedHours: number; // Estimated build time in hours (1-8)        |
| deliverable: string; // What the finished product looks like hints:   |
| string\[\]; // 2-3 optional hints/directions (not full solutions) }   |
+-----------------------------------------------------------------------+

**3.1.5 Roadmap (Full API response)**

+-----------------------------------------------------------------------+
| **Interface: Roadmap**                                                |
|                                                                       |
| interface Roadmap { id: string; // UUID v4 --- session roadmap        |
| identifier courseTitle: string; // Course title totalWeeks: number;   |
| // Total weeks in roadmap generatedAt: string; // ISO 8601 timestamp  |
| weeks: WeekModule\[\]; // Array of WeekModule (ordered by weekNumber) |
| }                                                                     |
+-----------------------------------------------------------------------+

**4. API Specification**

**4.1 Endpoints**

  ------------ ------------------ ------------------------------- -----------
  **Method**   **Endpoint**       **Description**                 **Auth**

  POST         /api/parse         Upload syllabus, returns        None
                                  roadmap JSON                    

  GET          /api/roadmap/:id   Retrieve a previously generated Session
                                  roadmap by session ID           

  GET          /api/health        Health check                    None
  ------------ ------------------ ------------------------------- -----------

**4.2 POST /api/parse**

**Request**

+-----------------------------------------------------------------------+
| **Content-Type: multipart/form-data**                                 |
|                                                                       |
| Fields: file (File, optional) --- PDF or DOCX file. Max size: 10MB    |
| rawText (string, optional) --- Plain text syllabus content            |
| courseTitle (string, optional) --- User-provided course title         |
| totalWeeks (number, optional) --- Force a specific week count         |
| Validation: - Either file OR rawText must be provided (not both, not  |
| neither) - file must be .pdf or .docx only - rawText must be minimum  |
| 100 characters - totalWeeks must be between 1 and 52 if provided      |
+-----------------------------------------------------------------------+

**Success Response --- 200 OK**

+-----------------------------------------------------------------------+
| **Response Body (application/json)**                                  |
|                                                                       |
| { \"success\": true, \"roadmap\": { \"id\": \"uuid-v4-string\",       |
| \"courseTitle\": \"Introduction to Python Programming\",              |
| \"totalWeeks\": 8, \"generatedAt\": \"2026-05-06T10:30:00.000Z\",     |
| \"weeks\": \[ { \"weekNumber\": 1, \"weekLabel\": \"Week 1\",         |
| \"topics\": \[\"Variables\", \"Data Types\", \"Basic Operators\"\],   |
| \"learningOutcomes\": \[\"Declare and assign variables\", \"Use int,  |
| float, string types\"\], \"projects\": \[ { \"id\":                   |
| \"uuid-v4-string\", \"title\": \"Unit Converter\", \"description\":   |
| \"Build a simple CLI tool that converts\...\", \"difficulty\":        |
| \"starter\", \"skillsUsed\": \[\"Variables\", \"Data Types\",         |
| \"Input/Output\"\], \"estimatedHours\": 2, \"deliverable\": \"A       |
| Python script that accepts user input\...\", \"hints\": \[\"Use the   |
| input() function\", \"Store results in variables\"\] } \] } \] } }    |
+-----------------------------------------------------------------------+

**Error Responses**

  ------------ ------------------- -------------------------------------------
  **Status**   **Error Code**      **Trigger Condition**

  400          MISSING_INPUT       Neither file nor rawText provided

  400          INVALID_FILE_TYPE   File is not PDF or DOCX

  400          FILE_TOO_LARGE      File exceeds 10MB

  400          TEXT_TOO_SHORT      rawText is under 100 characters

  422          PARSE_FAILED        Could not extract text from file

  422          AI_PARSE_FAILED     Claude API returned unparseable response

  500          AI_API_ERROR        Claude API call failed or timed out

  500          INTERNAL_ERROR      Unexpected server error
  ------------ ------------------- -------------------------------------------

+-----------------------------------------------------------------------+
| **Error Response Shape**                                              |
|                                                                       |
| { \"success\": false, \"error\": { \"code\": \"INVALID_FILE_TYPE\",   |
| \"message\": \"Only PDF and DOCX files are accepted.\", \"field\":    |
| \"file\" // optional --- which field caused the error } }             |
+-----------------------------------------------------------------------+

**5. AI Prompt Specification**

This section defines the exact prompts sent to the Claude API.
Developers must not change the system prompt without team review, as it
directly affects output quality and JSON structure.

**5.1 System Prompt**

+-----------------------------------------------------------------------+
| **SYSTEM PROMPT --- Do not modify without review**                    |
|                                                                       |
| You are an expert curriculum designer and software engineering        |
| mentor. Your job is to analyze a course syllabus and generate a       |
| structured weekly project roadmap for students. Rules you must follow |
| strictly: 1. Return ONLY valid JSON. No explanation, no markdown, no  |
| preamble. 2. Each week must have exactly 1 starter project and 1      |
| stretch project. 3. Projects must use ONLY skills taught up to and    |
| including that week. 4. Starter projects use only the current week\'s |
| skills. 5. Stretch projects may use current + all prior weeks\'       |
| skills. 6. estimatedHours must be a number between 1 and 8. 7. Each   |
| hints array must have exactly 2-3 items. 8. Do not suggest projects   |
| that require external APIs, paid services, or libraries not covered   |
| in the syllabus. 9. Keep project titles under 5 words. 10. Keep       |
| descriptions between 2-3 sentences.                                   |
+-----------------------------------------------------------------------+

**5.2 User Prompt Template**

+-----------------------------------------------------------------------+
| **USER PROMPT --- Variables in {{brackets}} are replaced at runtime** |
|                                                                       |
| Analyze this course syllabus and generate a weekly project roadmap.   |
| Course Title: {{courseTitle}} Total Weeks: {{totalWeeks}} Syllabus    |
| Content: \-\-- {{rawText}} \-\-- Return a JSON object that matches    |
| this exact structure: { \"courseTitle\": \"string\", \"totalWeeks\":  |
| number, \"weeks\": \[ { \"weekNumber\": number, \"weekLabel\":        |
| \"string\", \"topics\": \[\"string\"\], \"learningOutcomes\":         |
| \[\"string\"\], \"projects\": \[ { \"title\": \"string\",             |
| \"description\": \"string\", \"difficulty\": \"starter\" \|           |
| \"stretch\", \"skillsUsed\": \[\"string\"\], \"estimatedHours\":      |
| number, \"deliverable\": \"string\", \"hints\": \[\"string\",         |
| \"string\"\] } \] } \] }                                              |
+-----------------------------------------------------------------------+

**5.3 Claude API Call Configuration**

  --------------- -------------------------- ---------------------------------
  **Parameter**   **Value**                  **Reason**

  model           claude-sonnet-4-20250514   Best balance of speed and output
                                             quality

  max_tokens      4096                       Sufficient for up to 16-week
                                             roadmaps

  temperature     0.3                        Low temp for consistent
                                             structured JSON output

  timeout         30000ms                    30 second timeout before
                                             returning AI_API_ERROR
  --------------- -------------------------- ---------------------------------

**5.4 Response Validation**

After receiving the Claude API response, the backend must validate the
JSON before returning it to the frontend. Use the following validation
logic:

-   Verify response is valid JSON (try/catch JSON.parse)

-   Verify weeks is an array with length \> 0

-   Verify each week has weekNumber (number), topics (array), projects
    (array)

-   Verify each project has title, description, difficulty,
    estimatedHours, hints

-   Verify difficulty is exactly \'starter\' or \'stretch\'

-   Verify estimatedHours is a number between 1 and 8

-   If validation fails → return 422 AI_PARSE_FAILED error

-   Add UUID v4 id field to roadmap and each project after validation
    (backend generates these, not AI)

**6. Frontend Specification**

**6.1 Tech Stack**

  ------------------ ------------- ----------------------------------------
  **Library**        **Version**   **Purpose**

  React              18.x          UI framework

  Vite               5.x           Build tool and dev server

  Tailwind CSS       3.x           Utility-first styling

  React Query        5.x           API state management and caching

  React Dropzone     14.x          Drag-and-drop file upload

  jsPDF              2.x           Client-side PDF export

  Lucide React       latest        Icon library

  React Router       6.x           Client-side routing
  ------------------ ------------- ----------------------------------------

**6.2 Page Routes**

  --------------- ------------------ ------------------------------------
  **Route**       **Component**      **Description**

  /               UploadPage         Landing page with syllabus upload UI

  /roadmap/:id    RoadmapPage        Generated roadmap dashboard view

  /error          ErrorPage          Generic error page with retry option
  --------------- ------------------ ------------------------------------

**6.3 Component Tree**

+-----------------------------------------------------------------------+
| **Component Hierarchy**                                               |
|                                                                       |
| App ├── UploadPage │ ├── HeroSection --- Title, tagline, value prop │ |
| ├── UploadCard │ │ ├── FileDropzone --- Drag & drop file upload area  |
| │ │ ├── TextPasteToggle --- Switch between file upload and text paste |
| │ │ ├── TextPasteArea --- Textarea for raw syllabus text │ │ ├──      |
| CourseTitleInput --- Optional course title override │ │ └──           |
| SubmitButton --- Triggers POST /api/parse │ └── LoadingOverlay ---    |
| Full-screen loading state during API call ├── RoadmapPage │ ├──       |
| RoadmapHeader --- Course title, week count, export button │ ├──       |
| WeekGrid --- CSS Grid layout of WeekCards │ │ └── WeekCard (×n) ---   |
| One card per week │ │ ├── WeekHeader --- \"Week N\" label + topic     |
| tags │ │ ├── TopicList --- List of topics covered this week │ │ └──   |
| ProjectCards │ │ ├── StarterProjectCard --- Green badge, starter      |
| project details │ │ └── StretchProjectCard --- Orange badge, stretch  |
| project details │ └── ExportButton --- Triggers jsPDF export └──      |
| ErrorPage └── RetryButton --- Returns to UploadPage                   |
+-----------------------------------------------------------------------+

**6.4 State Management**

  -------------- -------------- ------------------------ ---------------------------
  **State**      **Location**   **Type**                 **Description**

  uploadMode     UploadPage     useState: \'file\' \|    Toggle between upload and
                                \'text\'                 paste

  selectedFile   UploadPage     useState: File \| null   Currently selected file

  rawText        UploadPage     useState: string         Pasted syllabus text

  courseTitle    UploadPage     useState: string         Optional course title
                                                         override

  roadmap        React Query    QueryResult\<Roadmap\>   Server state for roadmap
                                                         data

  isLoading      React Query    boolean                  True while API call is in
                                                         flight

  error          React Query    Error \| null            API error state
  -------------- -------------- ------------------------ ---------------------------

**6.5 UI/UX Rules**

-   File upload area must show accepted file types: PDF, DOCX, max 10MB

-   While loading, show a full-screen overlay with animated spinner and
    message: \'Generating your roadmap\...\'

-   WeekCards must show: week number, topic tags, starter project
    (green), stretch project (orange/amber)

-   Each project card expands on click to show full description, hints,
    and deliverable

-   Export button generates a clean single-column PDF with all weeks

-   On mobile: single column layout. On desktop: 2-3 column grid

-   Error states must show the error message and a \'Try Again\' button
    --- never a blank screen

**7. Backend Specification**

**7.1 Tech Stack**

  -------------------- ------------- ----------------------------------------
  **Package**          **Version**   **Purpose**

  Node.js              20.x LTS      Runtime

  Express              5.x           HTTP server and routing

  multer               1.x           Multipart file upload handling

  pdf-parse            1.x           Extract text from PDF files

  mammoth              1.x           Extract text from DOCX files

  \@anthropic-ai/sdk   latest        Official Anthropic Claude SDK

  uuid                 9.x           Generate UUID v4 identifiers

  express-session      1.x           Session-based roadmap storage

  zod                  3.x           Runtime schema validation

  dotenv               16.x          Environment variable management

  cors                 2.x           CORS headers for frontend requests
  -------------------- ------------- ----------------------------------------

**7.2 Environment Variables**

+-----------------------------------------------------------------------+
| **Required .env variables --- never commit these to version control** |
|                                                                       |
| ANTHROPIC_API_KEY=sk-ant-\... \# Required: Claude API key PORT=3001   |
| \# Server port (default 3001) SESSION_SECRET=your-secret-here \#      |
| Required: express-session secret (min 32 chars) MAX_FILE_SIZE_MB=10   |
| \# Max upload size in MB (default 10) NODE_ENV=development \#         |
| \'development\' or \'production\' FRONTEND_URL=http://localhost:5173  |
| \# Allowed CORS origin                                                |
+-----------------------------------------------------------------------+

**7.3 File Structure**

+-----------------------------------------------------------------------+
| **Backend Directory Structure**                                       |
|                                                                       |
| /backend /src /routes parse.route.js --- POST /api/parse handler      |
| roadmap.route.js --- GET /api/roadmap/:id handler health.route.js --- |
| GET /api/health handler /services fileParser.service.js --- PDF +     |
| DOCX text extraction logic claude.service.js --- Claude API call +    |
| prompt construction validator.service.js --- Roadmap JSON validation  |
| (Zod schemas) roadmap.service.js --- Roadmap assembly (adds UUIDs,    |
| timestamps) /middleware upload.middleware.js --- Multer config + file |
| type validation errorHandler.middleware.js --- Global error handler   |
| /utils logger.js --- Console logging utility constants.js --- Shared  |
| constants (error codes, limits) app.js --- Express app setup          |
| server.js --- HTTP server entry point .env .env.example package.json  |
+-----------------------------------------------------------------------+

**7.4 Parse Route Logic**

The following pseudocode defines the exact logic for POST /api/parse.
All developers must follow this flow precisely:

+-----------------------------------------------------------------------+
| **POST /api/parse --- Step-by-step logic**                            |
|                                                                       |
| 1\. Receive multipart request via multer middleware 2. Validate: file |
| OR rawText must be present (not both, not neither) → If invalid:      |
| return 400 MISSING_INPUT 3. If file provided: a. Validate file type   |
| (pdf or docx only) → If invalid: return 400 INVALID_FILE_TYPE b.      |
| Validate file size (≤ MAX_FILE_SIZE_MB) → If invalid: return 400      |
| FILE_TOO_LARGE c. Extract text using fileParser.service.js → If       |
| extraction fails: return 422 PARSE_FAILED 4. If rawText provided: a.  |
| Validate length ≥ 100 characters → If invalid: return 400             |
| TEXT_TOO_SHORT 5. Detect courseTitle: a. Use user-provided            |
| courseTitle if present b. Otherwise, pass to Claude and let it detect |
| from text 6. Detect totalWeeks: a. Use user-provided totalWeeks if    |
| present b. Otherwise, let Claude auto-detect from content 7. Call     |
| claude.service.js with (rawText, courseTitle, totalWeeks) → If API    |
| call fails: return 500 AI_API_ERROR 8. Validate Claude response JSON  |
| using validator.service.js (Zod) → If validation fails: return 422    |
| AI_PARSE_FAILED 9. Assemble final Roadmap object via                  |
| roadmap.service.js (adds id, generatedAt, project UUIDs) 10. Store    |
| roadmap in session: req.session.roadmaps\[roadmap.id\] = roadmap 11.  |
| Return 200 with { success: true, roadmap }                            |
+-----------------------------------------------------------------------+

**8. Error Handling Strategy**

**8.1 Error Handling Principles**

-   All errors must use the standard error response shape (see Section
    4.2)

-   Never expose stack traces or internal error messages to the client
    in production

-   Log full error details server-side with timestamp and request ID

-   Frontend must handle all documented error codes and show
    user-friendly messages

-   Network timeout errors must show \'Something took too long ---
    please try again\'

**8.2 Frontend Error Messages**

  ------------------- ----------------------------------------------------
  **Error Code**      **User-Facing Message**

  MISSING_INPUT       Please upload a file or paste your syllabus text.

  INVALID_FILE_TYPE   Only PDF and Word (.docx) files are accepted.

  FILE_TOO_LARGE      Your file is too large. Please upload a file under
                      10MB.

  TEXT_TOO_SHORT      Your syllabus text is too short. Please paste more
                      content.

  PARSE_FAILED        We couldn\'t read your file. Try saving it as PDF
                      and re-uploading.

  AI_PARSE_FAILED     Something went wrong generating your roadmap. Please
                      try again.

  AI_API_ERROR        Our AI service is temporarily unavailable. Please
                      try again in a moment.

  INTERNAL_ERROR      An unexpected error occurred. Please try again.
  ------------------- ----------------------------------------------------

**9. Development Guidelines**

**9.1 Naming Conventions**

  ---------------- ---------------------- ------------------------------------
  **Item**         **Convention**         **Example**

  Variables        camelCase              rawText, courseTitle, weekNumber

  Functions        camelCase verb+noun    parseFile(), buildPrompt(),
                                          validateRoadmap()

  React Components PascalCase             WeekCard, UploadPage, RoadmapHeader

  CSS classes      Tailwind utilities     className=\'bg-blue-600 rounded-lg
                   only                   p-4\'

  API routes       kebab-case nouns       /api/parse, /api/roadmap/:id

  Files (backend)  camelCase + type       claude.service.js,
                   suffix                 upload.middleware.js

  Files (frontend) PascalCase for         WeekCard.jsx, RoadmapPage.jsx
                   components             

  Environment vars SCREAMING_SNAKE_CASE   ANTHROPIC_API_KEY, MAX_FILE_SIZE_MB

  Error codes      SCREAMING_SNAKE_CASE   INVALID_FILE_TYPE, AI_API_ERROR
  ---------------- ---------------------- ------------------------------------

**9.2 Code Rules**

-   Use TypeScript for all frontend code (.tsx/.ts)

-   Use JSDoc comments for all backend service functions

-   No inline styles in React --- Tailwind classes only

-   All API calls from frontend go through React Query --- no raw
    fetch() in components

-   Never store the ANTHROPIC_API_KEY anywhere client-side

-   All Claude API calls happen server-side only

-   Use async/await --- no .then() chains

-   Every route handler must have a try/catch block

**9.3 Git Workflow**

-   Branch naming: feature/\[ticket-id\]-short-description

-   Commit format: type(scope): message --- e.g. feat(parser): add PDF
    extraction

-   No direct commits to main --- all changes via pull request

-   PR must include: what changed, how to test, screenshots for UI
    changes

**9.4 Testing Requirements**

  --------------- ------------------------------ -------------------------
  **Layer**       **What to Test**               **Tool**

  Backend unit    fileParser, validator, roadmap Jest
                  assembler                      

  Backend         POST /api/parse with sample    Supertest
  integration     syllabi                        

  AI output       Claude response validation     Jest + mock
                  (mock Claude)                  

  Frontend        WeekCard, UploadCard rendering React Testing Library
  component                                      

  E2E             Full upload → roadmap flow     Playwright
  --------------- ------------------------------ -------------------------

**10. Deployment**

**10.1 Recommended Stack**

  ------------------ ------------------ ---------------------------------
  **Service**        **Provider**       **Notes**

  Frontend hosting   Vercel             Auto-deploy from main branch

  Backend hosting    Railway or Render  Node.js Docker container

  Environment        Platform dashboard Never in code or .env files in
  secrets                               repo

  File uploads       In-memory (multer  No disk storage needed for v1.0
                     memoryStorage)     

  Monitoring         Sentry (free tier) Error tracking for both frontend
                                        and backend
  ------------------ ------------------ ---------------------------------

**10.2 Production Checklist**

-   NODE_ENV=production set on backend

-   ANTHROPIC_API_KEY stored in platform secret vault

-   CORS configured to allow only production frontend URL

-   Rate limiting enabled: max 10 requests per IP per hour on /api/parse

-   File size limit enforced at nginx/load balancer level as well as
    multer

-   Sentry DSN configured for both frontend and backend

-   Health check endpoint /api/health returning 200 (for uptime
    monitoring)

**10.3 Rate Limiting**

+-----------------------------------------------------------------------+
| **Rate Limit Configuration**                                          |
|                                                                       |
| Use express-rate-limit package on /api/parse: windowMs: 60 \* 60 \*   |
| 1000 // 1 hour window max: 10 // 10 requests per IP per window        |
| message: { success: false, error: { code: \"RATE_LIMIT_EXCEEDED\",    |
| message: \"Too many requests. Please try again in an hour.\" } }      |
+-----------------------------------------------------------------------+

**11. Sample Data**

**11.1 Sample Input Syllabus**

+-----------------------------------------------------------------------+
| **Example syllabus text for testing**                                 |
|                                                                       |
| Introduction to Python Programming --- 8 Week Course Week 1:          |
| Fundamentals - Variables, data types (int, float, str, bool) - Basic  |
| operators and expressions - Input/output with print() and input()     |
| Week 2: Control Flow - if/elif/else statements - Comparison and       |
| logical operators - Nested conditionals Week 3: Loops - while loops - |
| for loops and range() - break and continue Week 4: Functions -        |
| Defining functions with def - Parameters and return values - Scope    |
| and variable lifetime Week 5: Lists and Tuples - Creating and         |
| indexing lists - List methods: append, remove, sort - Tuples and      |
| immutability Week 6: Dictionaries and Sets - Key-value pairs -        |
| Dictionary methods - Sets and set operations Week 7: File I/O and     |
| Error Handling - Reading and writing files - try/except blocks -      |
| Custom exceptions Week 8: Final Project - Combining all concepts -    |
| Code organization and documentation                                   |
+-----------------------------------------------------------------------+

**11.2 Sample Output (Week 1 only)**

+-----------------------------------------------------------------------+
| **Expected JSON output for Week 1**                                   |
|                                                                       |
| { \"weekNumber\": 1, \"weekLabel\": \"Week 1\", \"topics\":           |
| \[\"Variables\", \"Data Types\", \"Basic Operators\",                 |
| \"Input/Output\"\], \"learningOutcomes\": \[ \"Declare and assign     |
| variables of different types\", \"Use arithmetic operators\",         |
| \"Accept user input and display output\" \], \"projects\": \[ {       |
| \"title\": \"Personal Info Card\", \"description\": \"Build a CLI     |
| program that asks the user for their name, age, and city, then        |
| displays a neatly formatted profile card. Use variables to store each |
| input and string formatting to display it.\", \"difficulty\":         |
| \"starter\", \"skillsUsed\": \[\"Variables\", \"Input/Output\",       |
| \"String formatting\"\], \"estimatedHours\": 1, \"deliverable\": \"A  |
| Python script that prints a formatted card with user\'s info\",       |
| \"hints\": \[\"Use input() to collect each piece of info\", \"Use     |
| print() with f-strings to format the output\"\] }, { \"title\":       |
| \"Simple Calculator\", \"description\": \"Build a basic calculator    |
| that accepts two numbers and an operator from the user, then displays |
| the result. Handle addition, subtraction, multiplication, and         |
| division.\", \"difficulty\": \"stretch\", \"skillsUsed\":             |
| \[\"Variables\", \"Data Types\", \"Operators\", \"Input/Output\"\],   |
| \"estimatedHours\": 2, \"deliverable\": \"A Python script that        |
| performs and displays a calculation\", \"hints\": \[\"Convert input   |
| strings to float using float()\", \"Use variables to store both       |
| inputs before calculating\"\] } \] }                                  |
+-----------------------------------------------------------------------+
