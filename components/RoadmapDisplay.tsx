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

interface RoadmapDisplayProps {
  roadmap: {
    courseName: string;
    skillLevel: string;
    totalWeeks: number;
    weeks: Week[];
    overallSummary: string;
    recommendations: string[];
  };
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-900/30 border-green-500/30 text-green-300';
    case 'medium':
      return 'bg-yellow-900/30 border-yellow-500/30 text-yellow-300';
    case 'hard':
      return 'bg-red-900/30 border-red-500/30 text-red-300';
    default:
      return 'bg-slate-700/30 border-slate-500/30 text-slate-300';
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
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-lg p-6'>
        <h2 className='text-3xl font-bold text-white mb-2'>
          {roadmap.courseName}
        </h2>
        <p className='text-purple-300 mb-4 capitalize'>
          Skill Level: <span className='font-semibold'>{roadmap.skillLevel}</span> • Total Weeks:{' '}
          <span className='font-semibold'>{roadmap.totalWeeks}</span>
        </p>
        <p className='text-slate-300'>{roadmap.overallSummary}</p>
      </div>

      {/* Recommendations */}
      {roadmap.recommendations && roadmap.recommendations.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-2xl font-bold text-white flex items-center gap-2'>
            <span className='text-blue-400'>💡</span> Recommended Learning Paths
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {roadmap.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className='bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 hover:border-blue-400/50 transition-all group'
              >
                <div className='flex justify-between items-start mb-3'>
                  <span className='text-xs font-bold uppercase tracking-wider px-2 py-1 bg-blue-500/20 text-blue-300 rounded'>
                    {rec.type}
                  </span>
                  <span className='text-xs text-blue-400/70 font-medium'>
                    {rec.provider}
                  </span>
                </div>
                <h4 className='text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors'>
                  {rec.title}
                </h4>
                <p className='text-blue-200/80 text-sm mb-4 line-clamp-2'>
                  {rec.description}
                </p>
                
                {rec.steps && rec.steps.length > 0 && (
                  <div className='mb-4 space-y-2'>
                    <p className='text-xs font-bold text-blue-400 uppercase tracking-tight'>Step-by-step Guide:</p>
                    <ul className='space-y-1.5'>
                      {rec.steps.map((step, sIdx) => (
                        <li key={sIdx} className='text-sm text-blue-100/90 flex gap-2'>
                          <span className='text-blue-500 font-bold'>{sIdx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <a
                  href={rec.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors'
                >
                  View Resource
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weeks */}
      <div className='space-y-3'>
        {roadmap.weeks.map((week) => (
          <div
            key={week.week}
            className='bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden hover:border-purple-500/50 transition'
          >
            {/* Week Header */}
            <button
              onClick={() => toggleWeek(week.week - 1)}
              className='w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/20 transition text-left'
            >
              <div className='flex items-center gap-4 flex-1'>
                <div className='flex-shrink-0 w-12 h-12 bg-purple-600/30 border border-purple-500/50 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold'>W{week.week}</span>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>
                    Week {week.week}: {week.title}
                  </h3>
                  <p className='text-sm text-slate-400'>
                    {week.estimatedHoursPerWeek} hours/week
                  </p>
                </div>
              </div>
              <svg
                className={`w-6 h-6 text-purple-400 transition transform ${
                  expandedWeeks.has(week.week - 1) ? 'rotate-180' : ''
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 14l-7 7m0 0l-7-7m7 7V3'
                />
              </svg>
            </button>

            {/* Week Content */}
            {expandedWeeks.has(week.week - 1) && (
              <div className='px-6 pb-6 space-y-4 border-t border-slate-700 pt-4'>
                {/* Concepts */}
                <div>
                  <h4 className='text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide'>
                    📚 Key Concepts
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {week.concepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className='bg-purple-900/30 border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm'
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                {week.projects && week.projects.length > 0 && (
                  <div>
                    <h4 className='text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide'>
                      🚀 Projects
                    </h4>
                    <div className='space-y-2'>
                      {week.projects.map((project, idx) => (
                        <div
                          key={idx}
                          className={`border rounded-lg p-3 ${getDifficultyColor(
                            project.difficulty
                          )}`}
                        >
                          <div className='flex items-start justify-between mb-1'>
                            <h5 className='font-medium'>{project.name}</h5>
                            <span className='text-xs font-semibold capitalize px-2 py-1 bg-black/30 rounded'>
                              {project.difficulty}
                            </span>
                          </div>
                          <p className='text-sm opacity-90 mb-2'>
                            {project.description}
                          </p>
                          <p className='text-xs opacity-75'>
                            ⏱️ {project.estimatedHours} hours
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercises */}
                {week.exercises && week.exercises.length > 0 && (
                  <div>
                    <h4 className='text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide'>
                      ✏️ Exercises
                    </h4>
                    <ul className='space-y-1'>
                      {week.exercises.map((exercise, idx) => (
                        <li
                          key={idx}
                          className='text-green-200 text-sm flex items-start gap-2'
                        >
                          <span className='mt-1'>•</span>
                          <span>{exercise}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resources */}
                {week.resources && week.resources.length > 0 && (
                  <div>
                    <h4 className='text-sm font-semibold text-orange-300 mb-2 uppercase tracking-wide'>
                      🔗 Resources
                    </h4>
                    <ul className='space-y-1'>
                      {week.resources.map((resource, idx) => (
                        <li
                          key={idx}
                          className='text-orange-200 text-sm flex items-start gap-2'
                        >
                          <span className='mt-1'>•</span>
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export Button */}
      <div className='flex gap-2 justify-center pt-4'>
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
          className='bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition'
        >
          📥 Export as JSON
        </button>
      </div>
    </div>
  );
}
