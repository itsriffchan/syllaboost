'use client';

import { useState } from 'react';
import SyllabusUpload from '@/components/SyllabusUpload';
import RoadmapDisplay from '@/components/RoadmapDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Roadmap {
  courseName: string;
  skillLevel: string;
  totalWeeks: number;
  weeks: Array<{
    week: number;
    title: string;
    concepts: string[];
    projects: Array<{
      name: string;
      description: string;
      difficulty: 'easy' | 'medium' | 'hard';
      estimatedHours: number;
    }>;
    exercises: string[];
    resources: string[];
    estimatedHoursPerWeek: number;
  }>;
  overallSummary: string;
  recommendations: string[];
}

export default function Home() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRoadmap = async (
    syllabus: string,
    skillLevel: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syllabus, skillLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details ? `${data.error}: ${data.details}` : data.error;
        throw new Error(errorMessage || 'Failed to generate roadmap');
      }

      setRoadmap(data.roadmap);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      console.error('Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-5xl font-bold text-white mb-4'>
            Syllabus AI
          </h1>
          <p className='text-xl text-purple-300 max-w-2xl mx-auto'>
            Transform your course syllabus into a personalized learning roadmap.
            Upload your syllabus, select your skill level, and get a week-by-week
            guide with projects and exercises tailored to your level.
          </p>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {/* Left Column - Upload Section */}
          <div className='lg:col-span-1'>
            <div className='sticky top-8'>
              <SyllabusUpload
                onSubmit={handleGenerateRoadmap}
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className='lg:col-span-2'>
            {loading && <LoadingSpinner />}

            {error && (
              <div className='bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4'>
                <p className='text-red-200 font-semibold mb-2'>Error</p>
                <p className='text-red-300 text-sm'>{error}</p>
                {error.includes('API') && (
                  <p className='text-red-400 text-xs mt-2'>
                    💡 Tip: Make sure your Groq API key is valid and has available credits.
                  </p>
                )}
                {error.includes('syllabus') && (
                  <p className='text-red-400 text-xs mt-2'>
                    💡 Tip: Try pasting the syllabus text directly instead of uploading a file.
                  </p>
                )}
              </div>
            )}

            {roadmap && !loading && <RoadmapDisplay roadmap={roadmap} />}

            {!roadmap && !loading && !error && (
              <div className='bg-slate-800/50 border border-purple-500/30 rounded-lg p-8 text-center'>
                <p className='text-purple-300 text-lg'>
                  Upload a syllabus to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
