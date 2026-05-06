import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory session storage (for demo; use a database in production)
const sessions = new Map();

// Utility: Extract text from base64 PDF
async function extractTextFromPDF(base64) {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '';
  }
}

// Utility: Extract text from base64 DOCX
async function extractTextFromDOCX(base64) {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return '';
  }
}

// Utility: Generate roadmap using Groq
async function generateRoadmapWithGroq(syllabusText, courseTitle) {
  const systemPrompt = `You are an expert course instructor and curriculum designer. Your task is to analyze a course syllabus and generate a detailed weekly project roadmap.

For each week, you must generate:
- Week number and label
- Topics covered
- Learning outcomes
- 2 projects: 1 starter project and 1 stretch project

Each project should include:
- Unique ID (use format "proj_weekN_TYPE")
- Title
- Description (2-3 sentences)
- Difficulty ("starter" or "stretch")
- Skills used (array of 3-5 skill names)
- Estimated hours to complete
- Deliverable (what they should produce)
- Hints (array of 2-3 hints)

Return ONLY a valid JSON object with no extra text. Structure:
{
  "courseTitle": "Course Title",
  "totalWeeks": number,
  "weeks": [
    {
      "weekNumber": 1,
      "weekLabel": "Week 1: Topic",
      "topics": ["topic1", "topic2"],
      "learningOutcomes": ["outcome1", "outcome2"],
      "projects": [
        {
          "id": "proj_week1_starter",
          "title": "Project Title",
          "description": "Description",
          "difficulty": "starter",
          "skillsUsed": ["skill1", "skill2"],
          "estimatedHours": 5,
          "deliverable": "What to deliver",
          "hints": ["hint1", "hint2"]
        }
      ]
    }
  ]
}`;

  const userPrompt = `Course Title: ${courseTitle || 'Unknown'}

Syllabus Content:
${syllabusText}

Generate a detailed weekly project roadmap based on this syllabus. Ensure each week has exactly 2 projects (starter and stretch difficulty).`;

  try {
    const message = await groq.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Groq');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonText = content.text;
    const jsonMatch = jsonText.match(/```json\n?([\s\S]*?)\n?```/) || jsonText.match(/({[\s\S]*})/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const roadmapData = JSON.parse(jsonText);
    return roadmapData;
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SyllabusAI backend is running' });
});

// Main parse endpoint
app.post('/api/parse', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName, rawText, courseTitle } = req.body;

    let syllabusText = '';

    // Extract text from uploaded file
    if (fileBase64) {
      if (mimeType === 'application/pdf') {
        syllabusText = await extractTextFromPDF(fileBase64);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        syllabusText = await extractTextFromDOCX(fileBase64);
      } else {
        // Assume plain text
        syllabusText = Buffer.from(fileBase64, 'base64').toString('utf-8');
      }
    } else if (rawText) {
      syllabusText = rawText;
    }

    if (!syllabusText || syllabusText.trim().length < 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Syllabus text must be at least 100 characters',
        },
      });
    }

    // Truncate to avoid token limits
    const truncatedText = syllabusText.substring(0, 6000);

    // Generate roadmap
    const roadmapData = await generateRoadmapWithGroq(truncatedText, courseTitle || 'Course');

    // Create roadmap with ID and timestamp
    const roadmapId = uuidv4();
    const roadmap = {
      id: roadmapId,
      courseTitle: roadmapData.courseTitle,
      totalWeeks: roadmapData.totalWeeks,
      generatedAt: new Date().toISOString(),
      weeks: roadmapData.weeks,
    };

    // Store in session
    sessions.set(roadmapId, roadmap);

    res.json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PARSING_FAILED',
        message: error.message || 'Failed to parse syllabus',
      },
    });
  }
});

// Retrieve roadmap endpoint
app.get('/api/roadmap/:id', (req, res) => {
  const { id } = req.params;
  const roadmap = sessions.get(id);

  if (!roadmap) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Roadmap not found',
      },
    });
  }

  res.json({
    success: true,
    data: roadmap,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 SyllabusAI backend running on http://localhost:${PORT}`);
  console.log(`📝 POST /api/parse - Generate roadmap from syllabus`);
  console.log(`📊 GET /api/roadmap/:id - Retrieve generated roadmap`);
  console.log(`💚 GET /api/health - Health check`);
});
