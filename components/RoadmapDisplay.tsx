'use client';

import { useState } from 'react';

interface Week {
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
}

interface Recommendation {
  type: 'guide' | 'certification' | 'course' | 'step-by-step';
  title: string;
  description: string;
  provider: string;
  url: string;
  steps?: string[];
}

interface RoadmapDisplayProps {
  roadmap: {
    courseName: string;
    skillLevel: string;
    totalWeeks: number;
    weeks: Week[];
    overallSummary: string;
    recommendations: Recommendation[];
  };
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'medium':
      return 'bg-amber-50 border-amber-200 text-amber-700';
    case 'hard':
      return 'bg-rose-50 border-rose-200 text-rose-700';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-700';
  }
};

export default function RoadmapDisplay({ roadmap }: RoadmapDisplayProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set([0])
  );

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  return (
    <div className='space-y-10'>
      {/* Header */}
      <div className='relative'>
        <div className="absolute -top-12 -left-6 text-8xl font-black text-purple-600/5 select-none pointer-events-none uppercase">
          Roadmap
        </div>
        <div className='bg-white/80 backdrop-blur-xl border border-white rounded-[40px] p-10 shadow-2xl shadow-purple-200/40 relative overflow-hidden'>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-bl-[100px] -mr-8 -mt-8"></div>
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Generated Path
            </span>
            <div className="h-px flex-1 bg-purple-100"></div>
          </div>
          <h2 className='text-5xl font-black text-[#2d1b4e] mb-4 leading-tight'>
            {roadmap.courseName}
          </h2>
          <div className="flex flex-wrap gap-4 items-center text-sm font-bold">
            <span className='bg-purple-50 text-purple-600 px-4 py-2 rounded-2xl border border-purple-100 capitalize'>
              🎯 {roadmap.skillLevel}
            </span>
            <span className='bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl border border-indigo-100'>
              ⏳ {roadmap.totalWeeks} Weeks
            </span>
          </div>
          <p className='mt-6 text-slate-500 leading-relaxed text-lg italic'>"{roadmap.overallSummary}"</p>
        </div>
      </div>

      {/* Recommendations */}
      {roadmap.recommendations && roadmap.recommendations.length > 0 && (
        <div className='space-y-6'>
          <div className="flex items-center gap-4">
            <h3 className='text-3xl font-black text-[#2d1b4e] uppercase tracking-tighter'>
              Expert Recommendations
            </h3>
            <div className="h-1 w-24 bg-purple-600 rounded-full"></div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {roadmap.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className='bg-white border-2 border-slate-50 rounded-[32px] p-6 hover:border-purple-200 transition-all group shadow-xl shadow-slate-200/50 relative overflow-hidden'
              >
                <div className='flex justify-between items-start mb-4'>
                  <span className='text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100'>
                    {rec.type}
                  </span>
                  <span className='text-xs text-slate-600 font-bold'>
                    {rec.provider}
                  </span>
                </div>
                <h4 className='text-xl font-black text-[#2d1b4e] mb-3 group-hover:text-purple-600 transition-colors'>
                  {rec.title}
                </h4>
                <p className='text-slate-500 text-sm mb-6 leading-relaxed'>
                  {rec.description}
                </p>
                
                {rec.steps && rec.steps.length > 0 && (
                  <div className='mb-6 bg-slate-50 rounded-2xl p-4'>
                    <p className='text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3'>Action Plan:</p>
                    <ul className='space-y-2.5'>
                      {rec.steps.map((step, sIdx) => (
                        <li key={sIdx} className='text-xs text-slate-600 flex gap-3 font-bold'>
                          <span className='w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] text-purple-600 border border-purple-100 flex-shrink-0'>{sIdx + 1}</span>
                          <span className="leading-tight">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <a
                  href={rec.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full inline-flex items-center justify-center py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-purple-600 transition-colors gap-2'
                >
                  Explore Resource
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weeks */}
      <div className='space-y-4'>
        <div className="flex items-center gap-4 mb-6">
          <h3 className='text-3xl font-black text-[#2d1b4e] uppercase tracking-tighter'>
            Curriculum Timeline
          </h3>
          <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
        </div>
        
        {roadmap.weeks.map((week) => (
          <div
            key={week.week}
            className={`bg-white border-2 transition-all duration-500 ${
              expandedWeeks.has(week.week - 1) 
                ? 'border-purple-200 rounded-[32px] shadow-2xl shadow-purple-100/50' 
                : 'border-slate-50 rounded-2xl hover:border-purple-100'
            } overflow-hidden`}
          >
            {/* Week Header */}
            <button
              onClick={() => toggleWeek(week.week - 1)}
              className='w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 transition text-left'
            >
              <div className='flex items-center gap-6 flex-1'>
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  expandedWeeks.has(week.week - 1) ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className='text-xl font-black'>W{week.week}</span>
                </div>
                <div>
                  <h3 className={`text-xl font-black transition-colors ${
                    expandedWeeks.has(week.week - 1) ? 'text-[#2d1b4e]' : 'text-slate-500'
                  }`}>
                    {week.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className='text-xs font-bold text-slate-600 uppercase tracking-widest'>
                      ⏱️ {week.estimatedHoursPerWeek} hours
                    </span>
                    <div className="flex gap-1">
                      {week.concepts.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-200"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                expandedWeeks.has(week.week - 1) ? 'border-purple-600 bg-purple-50 rotate-180' : 'border-slate-100'
              }`}>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Week Content */}
            {expandedWeeks.has(week.week - 1) && (
              <div className='px-8 pb-8 space-y-8 animate-in slide-in-from-top-4 duration-500'>
                <div className="h-px w-full bg-slate-50"></div>
                
                {/* Concepts */}
                <div>
                  <h4 className='text-[10px] font-black text-purple-600 mb-4 uppercase tracking-[0.2em]'>
                    Core Concepts
                  </h4>
                  <div className='flex flex-wrap gap-3'>
                    {week.concepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className='bg-white border-2 border-slate-50 text-[#2d1b4e] px-4 py-2 rounded-xl text-xs font-bold shadow-sm'
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Grid for Projects & Resources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Projects */}
                  {week.projects && week.projects.length > 0 && (
                    <div className="space-y-4">
                      <h4 className='text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]'>
                        Milestone Projects
                      </h4>
                      <div className='space-y-3'>
                        {week.projects.map((project, idx) => (
                          <div
                            key={idx}
                            className={`border-2 rounded-[24px] p-5 ${getDifficultyColor(
                              project.difficulty
                            )}`}
                          >
                            <div className='flex items-start justify-between mb-3'>
                              <h5 className='font-black text-sm uppercase tracking-tight'>{project.name}</h5>
                              <span className='text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/50 rounded-lg'>
                                {project.difficulty}
                              </span>
                            </div>
                            <p className='text-xs font-medium leading-relaxed mb-4'>
                              {project.description}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase opacity-60">
                              <span>⏱️</span>
                              <span>{project.estimatedHours} Hours Required</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exercises & Resources */}
                  <div className="space-y-8">
                    {week.exercises && week.exercises.length > 0 && (
                      <div>
                        <h4 className='text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4'>
                          Skills Practice
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {week.exercises.map((exercise, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                              <span className="text-emerald-500 font-bold text-xs">✓</span>
                              <span className="text-xs font-bold text-emerald-900">{exercise}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {week.resources && week.resources.length > 0 && (
                      <div>
                        <h4 className='text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-4'>
                          Deep Dive Resources
                        </h4>
                        <div className="space-y-2">
                          {week.resources.map((resource, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100/50">
                              <span className="text-orange-500 text-xs">🔗</span>
                              <span className="text-xs font-bold text-orange-900">{resource}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export Button */}
      <div className='flex gap-4 justify-center pt-8'>
        <button
          onClick={() => {
            const content = JSON.stringify(roadmap, null, 2);
            const element = document.createElement('a');
            element.setAttribute(
              'href',
              'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
            );
            element.setAttribute('download', 'course-roadmap.json');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
          className='bg-white border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded-2xl hover:border-purple-400 hover:text-purple-600 transition-all shadow-xl shadow-slate-100'
        >
          📥 Archive Roadmap (JSON)
        </button>
      </div>
    </div>
  );
}
