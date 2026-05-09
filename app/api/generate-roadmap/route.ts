import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { parseSyllabusText, formatParsedSyllabusForAI } from '@/lib/pdfParser';

async function callGroq(prompt: string) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const message = await (groq.chat.completions as any).create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' }
  });

  return message.choices[0].message.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const { syllabus, skillLevel } = await request.json();

    if (!syllabus || !skillLevel) {
      return NextResponse.json(
        { error: 'Syllabus and skill level are required' },
        { status: 400 }
      );
    }

    if (syllabus.length < 100) {
      return NextResponse.json(
        { error: 'Syllabus content is too short. Please provide more detailed syllabus information.' },
        { status: 400 }
      );
    }

    // Parse the syllabus to extract only important information
    console.log('Parsing syllabus...');
    const parsedSyllabus = parseSyllabusText(syllabus);
    
    // Format the parsed data concisely for AI processing
    const formattedSyllabus = formatParsedSyllabusForAI(parsedSyllabus);
    
    console.log(`Parsed ${parsedSyllabus.weeks.length} weeks. Formatted length: ${formattedSyllabus.length} characters`);

    // Provide a more flexible prompt that allows the AI to correct parser errors
    const prompt = `You are an expert curriculum designer and senior industry mentor.
Your task is to transform a course syllabus into a personalized, high-stakes learning roadmap that focuses on practical, job-ready skills.

### CONTEXT:
The following is an extracted breakdown of a FEUTECH course syllabus:
${formattedSyllabus}

### ADDITIONAL SYLLABUS CONTENT (TRUNCATED):
${syllabus.substring(0, 4000)}

### TARGET STUDENT:
Skill Level: ${skillLevel}

### INSTRUCTIONS:
1. **Analyze the Content**: Review the module breakdown and the raw text. You MUST focus on the technical topics and Intended Learning Outcomes (ILOs) mentioned.
2. **STRICT ADHERENCE**: The roadmap MUST strictly follow the progression and scope defined in the syllabus. DO NOT add topics that are not covered in the curriculum.
3. **Map Projects to ILOs**: For every week/module, the projects and exercises MUST be designed to achieve the specific ILOs listed for that module.
4. **Refine Metadata**: Use the raw text to find the correct Course Title and Module titles as written in the syllabus.
5. **Build the Timeline**: Create a week-by-week roadmap where each entry corresponds EXACTLY to a module in the syllabus.
6. **Tailor to Level**: 
   - Adjust the complexity of projects based on the student's ${skillLevel} level, but STAY within the syllabus boundaries.
7. **Avoid Vague Projects**: Suggest niche, specific projects (e.g. "JWT Auth System") but ensure they are RELEVANT to that week's syllabus topics.
8. **Technical Stack**: Suggest a tech stack that aligns with the course (e.g. if the syllabus is about Java, don't suggest Python).
9. **Niche Recommendations**: Suggest resources that help master the specific topics in the syllabus.

### OUTPUT FORMAT:
You MUST respond with a valid JSON object matching this structure:
{
  "courseName": "Specific Course Title",
  "skillLevel": "${skillLevel}",
  "totalWeeks": [Total number of weeks/modules],
  "weeks": [
    {
      "week": 1,
      "title": "Module Title",
      "concepts": ["Technical Concept 1", "Technical Concept 2"],
      "projects": [
        {
          "name": "Niche Project Name (e.g. JWT Auth System)",
          "description": "Specific project description including the suggested tech stack. Explain EXACTLY what to build.",
          "difficulty": "easy|medium|hard",
          "estimatedHours": 6
        }
      ],
      "exercises": ["Concrete practice task 1", "Concrete practice task 2"],
      "resources": ["Specific tutorial link, documentation page, or library name"],
      "estimatedHoursPerWeek": 15
    }
  ],
  "overallSummary": "A high-level summary of the professional competence the student will gain",
  "recommendations": [
    {
      "type": "guide|certification|course|step-by-step",
      "title": "Specific Resource Title",
      "description": "Exactly why this resource is vital for a ${skillLevel} student",
      "provider": "Provider name",
      "url": "URL",
      "steps": ["Actionable step 1", "Actionable step 2"]
    }
  ]
}

Ensure the "weeks" array reflects the full progression of the syllabus. If ${parsedSyllabus.totalWeeks} modules were identified, provide at least that many entries.`;

    let responseText = '';

    try {
      console.log('Calling Groq API...');
      responseText = await callGroq(prompt);
      console.log('Groq API success');
    } catch (groqError: any) {
      const groqErrorDetail = groqError.message || String(groqError);
      console.error('Groq API failed:', groqErrorDetail);

      return NextResponse.json(
        {
          error: 'AI Service Error',
          details: groqErrorDetail.substring(0, 500),
        },
        { status: 503 }
      );
    }

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse roadmap. The response did not contain valid JSON.');
    }

    let roadmap;
    try {
      roadmap = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse JSON from response.');
    }

    return NextResponse.json({
      roadmap,
    });
  } catch (error) {
    console.error('Error processing syllabus:', error);
    return NextResponse.json(
      {
        error: 'Failed to process syllabus',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
