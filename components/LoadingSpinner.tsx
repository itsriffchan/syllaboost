'use client';

export default function LoadingSpinner() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <div className='relative w-16 h-16'>
        {/* Outer circle */}
        <div className='absolute inset-0 border-4 border-purple-500/20 rounded-full'></div>

        {/* Spinning circle */}
        <div className='absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-spin'></div>
      </div>

      <div className='mt-6 text-center'>
        <h3 className='text-lg font-semibold text-[#2d1b4e] mb-2'>
          Generating Your Roadmap
        </h3>
        <p className='text-slate-500'>
          Processing your syllabus with AI...
        </p>
      </div>

      {/* Animated dots */}
      <div className='mt-4 flex gap-1'>
        <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce' style={{ animationDelay: '0s' }}></div>
        <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
        <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce' style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
