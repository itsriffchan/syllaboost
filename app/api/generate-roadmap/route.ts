import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

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
  });

  return message.choices[0].message.content || '';
}

async function callGemini(prompt: string) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
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

    // Truncate syllabus if it's too long
    const maxLength = 8000;
    const truncatedSyllabus = syllabus.length > maxLength 
      ? syllabus.substring(0, maxLength) + '... [truncated]' 
      : syllabus;
    
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
  "recommendations": [
    {
      "type": "guide|certification|course|step-by-step",
      "title": "string",
      "description": "string",
      "provider": "string",
      "url": "string",
      "steps": ["string"]
    }
  ]
}

Ensure the recommendations are highly structured, providing actual step-by-step guides and specific certifications from reputable platforms (e.g., freeCodeCamp, DataCamp, Coursera, etc.) that complement the syllabus.`;

    let responseText = '';
    let usedFallback = false;
    let groqErrorDetail = '';
    let geminiErrorDetail = '';

    try {
      console.log('Attempting Groq API...');
      responseText = await callGroq(prompt);
      console.log('Groq API success');
    } catch (groqError: any) {
      groqErrorDetail = groqError.message || String(groqError);
      if (groqError.status === 429) {
        groqErrorDetail = 'Groq API rate limit exceeded';
      } else if (groqError.status === 401) {
        groqErrorDetail = 'Invalid Groq API key';
      }
      
      console.error('Groq API failed:', groqErrorDetail);
      
      try {
        console.log('Attempting Gemini fallback...');
        responseText = await callGemini(prompt);
        usedFallback = true;
        console.log('Gemini Fallback success');
      } catch (geminiError: any) {
        geminiErrorDetail = geminiError.message || String(geminiError);
        // Check for Gemini rate limit (usually mentions "429" or "exhausted")
        if (geminiErrorDetail.includes('429') || geminiErrorDetail.toLowerCase().includes('quota')) {
          geminiErrorDetail = 'Gemini API rate limit exceeded';
        } else if (geminiErrorDetail.includes('401') || geminiErrorDetail.toLowerCase().includes('api key')) {
          geminiErrorDetail = 'Invalid Gemini API key';
        }

        console.error('Gemini Fallback also failed:', geminiErrorDetail);
        
        return NextResponse.json(
          { 
            error: 'AI Services Unavailable',
            details: `Groq: ${groqErrorDetail.substring(0, 100)}. Gemini: ${geminiErrorDetail.substring(0, 100)}.`,
            groqError: groqErrorDetail,
            geminiError: geminiErrorDetail
          },
          { status: 503 }
        );
      }
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
      success: true,
      roadmap,
      fallbackUsed: usedFallback
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
