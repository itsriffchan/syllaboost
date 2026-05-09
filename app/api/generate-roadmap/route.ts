import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { parseSyllabusText, formatParsedSyllabusForAI } from '@/lib/pdfParser';

async function callGroq(prompt: string) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const message = await (groq.chat.completions as any).create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    max_tokens: 2048,
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

    const prompt = `You are an expert curriculum designer. Based on the following FEUTECH course structure with modules, create a detailed learning roadmap for a ${skillLevel} level student.

${formattedSyllabus}

Generate a comprehensive MODULE-based learning roadmap in the following JSON format. Match the number of weeks to the number of modules extracted:
{
  "courseName": "${parsedSyllabus.courseName}",
  "skillLevel": "${skillLevel}",
  "totalWeeks": ${parsedSyllabus.totalWeeks},
  "weeks": [
    {
      "week": 1,
      "title": "MODULE 1: [Topic]",
      "concepts": ["concept1", "concept2"],
      "projects": [
        {
          "name": "Project name",
          "description": "Description",
          "difficulty": "easy|medium|hard",
          "estimatedHours": 3
        }
      ],
      "exercises": ["exercise1", "exercise2"],
      "resources": ["resource1", "resource2"],
      "estimatedHoursPerWeek": 10
    }
  ],
  "overallSummary": "Summary of the entire course",
  "recommendations": [
    {
      "type": "guide|certification|course|step-by-step",
      "title": "Title",
      "description": "Description",
      "provider": "Provider",
      "url": "https://example.com",
      "steps": ["step1", "step2"]
    }
  ]
}

Instructions:
- Create ${parsedSyllabus.totalWeeks} weeks matching each MODULE
- Base project difficulty on ${skillLevel} level
- Each week should have 2-3 projects and 3-4 exercises
- Estimate 8-12 hours per week
- Provide specific, actionable exercises aligned to module topics
- Recommend resources from: freeCodeCamp, Coursera, official documentation, Udacity
- Match the week count exactly to ${parsedSyllabus.totalWeeks}`;

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
