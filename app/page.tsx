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
  recommendations: Array<{
    type: 'guide' | 'certification' | 'course' | 'step-by-step';
    title: string;
    description: string;
    provider: string;
    url: string;
    steps?: string[];
  }>;
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
    <main className='min-h-screen bg-gradient-to-br from-[#d4f3ef] via-[#e8dbf2] to-[#f4eefb] selection:bg-purple-200'>
      <div className='container mx-auto px-4 py-12'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-7xl md:text-8xl font-bold mb-2 tracking-tight'>
            <span className="text-[#2d1b4e] inline-block">Sylla</span>
            <span className="italic bg-gradient-to-r from-[#8b5cf6] to-[#d8b4fe] bg-clip-text text-transparent pr-4 inline-block">Boost</span>
          </h1>
          <p className='text-2xl font-bold text-[#2d1b4e] mb-8'>
            Upload, Work, Upskill
          </p>
          <p className='text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed italic'>
            Transform your course syllabus into a personalized learning roadmap. 
            Upload your syllabus, select your skill level, and get a week-by-week 
            guide with projects and exercises tailored to your level.
          </p>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto'>
          {/* Left Column - Upload Section */}
          <div className='lg:col-span-4'>
            <div className='sticky top-8'>
              <SyllabusUpload
                onSubmit={handleGenerateRoadmap}
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className='lg:col-span-8'>
            {loading && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-xl rounded-[40px] border border-white/80 shadow-2xl">
                <LoadingSpinner />
                <p className="mt-4 text-purple-600 font-medium animate-pulse">Analyzing Syllabus...</p>
              </div>
            )}

            {error && (
              <div className='bg-red-50 border border-red-200 rounded-[32px] p-8 mb-8 shadow-xl animate-in fade-in zoom-in duration-300'>
                <div className='flex items-start gap-4'>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">⚠️</div>
                  <div className='flex-1'>
                    <p className='text-red-900 font-bold text-xl mb-2'>Generation Failed</p>
                    <p className='text-red-700 leading-relaxed mb-4'>{error}</p>
                    <div className='flex flex-wrap gap-2'>
                      {error.includes('rate limit') && (
                        <span className='bg-red-200 text-red-700 text-xs px-3 py-1 rounded-full font-bold uppercase'>
                          Rate Limited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {roadmap && !loading && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                <RoadmapDisplay roadmap={roadmap} />
              </div>
            )}

            {!roadmap && !loading && !error && (
              <div className='bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-16 text-center shadow-inner'>
                <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📄</div>
                <p className='text-[#2d1b4e] text-xl font-medium'>
                  Upload a syllabus to build your path
                </p>
                <p className="text-slate-500 mt-2">Your personalized roadmap will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
