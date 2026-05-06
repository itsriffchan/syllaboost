import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { syllabus, skillLevel } = await request.json();

    if (!syllabus || !skillLevel) {
      return NextResponse.json(
        { error: 'Syllabus and skill level are required' },
        { status: 400 }
      );
    }

    // Truncate syllabus if it's too long (Groq has token limits)
    const maxLength = 4000;
    const truncatedSyllabus = syllabus.substring(0, maxLength);
    if (syllabus.length > maxLength) {
      console.warn(`Syllabus truncated from ${syllabus.length} to ${maxLength} characters`);
    }

    const prompt = `You are an educational curriculum expert. You have received the following course syllabus:

${truncatedSyllabus}

The student has a skill level of: ${skillLevel} (beginner, intermediate, or advanced)

Based on this syllabus, create a detailed week-by-week learning roadmap that:
1. Breaks down the course by week
2. Lists the key concepts taught in each week
3. Suggests practical projects and exercises for the ${skillLevel} level
4. Provides estimated time commitments
5. Suggests resources and practice problems

Format your response as a structured JSON object with the following schema:
{
  "courseName": "string",
  "skillLevel": "string",
  "totalWeeks": number,
  "weeks": [
    {
      "week": number,
      "title": "string",
      "concepts": ["string"],
      "projects": [
        {
          "name": "string",
          "description": "string",
          "difficulty": "easy|medium|hard",
          "estimatedHours": number
        }
      ],
      "exercises": ["string"],
      "resources": ["string"],
      "estimatedHoursPerWeek": number
    }
  ],
  "overallSummary": "string",
  "recommendations": ["string"]
}`;

    console.log('Calling Groq API with prompt length:', prompt.length);
    
    const message = await (groq.chat.completions as any).create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('Groq API response received');
    
    const responseText =
      message.choices[0].message.content || '';

    console.log('Response text length:', responseText.length);

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse roadmap from Groq response. The response did not contain valid JSON.' },
        { status: 500 }
      );
    }

    let roadmap;
    try {
      roadmap = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0].substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse JSON from response. The response format was invalid.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error('Error processing syllabus:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : 'No stack trace';
    
    return NextResponse.json(
      {
        error: 'Failed to process syllabus',
        details: errorMessage,
        type: error instanceof Error ? error.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}
