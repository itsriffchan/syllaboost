'use client';

import { useState, useEffect } from 'react';

interface SyllabusUploadProps {
  onSubmit: (syllabus: string, skillLevel: string) => void;
  loading: boolean;
}

export default function SyllabusUpload({
  onSubmit,
  loading,
}: SyllabusUploadProps) {
  const [syllabus, setSyllabus] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamically import pdfjs-dist only on the client
      const pdfjsLib = await import('pdfjs-dist');
      
      // Use local worker from pdfjs-dist using new URL pattern for better reliability in production
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Try with default parameters first
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useSystemFonts: true,
          disableFontFace: false,
        }).promise;
      } catch {
        // Fallback: try with more lenient parsing
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useSystemFonts: true,
          stopAtErrors: false,
        }).promise;
      }

      let text = '';
      let pageCount = 0;

      // Extract text from each page with enhanced text extraction
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          let pageText = '';
          
          try {
            // First, try standard text content extraction
            const textContent = await page.getTextContent();
            
            // Build text with proper spacing
            let lastY = -1;
            pageText = textContent.items
              .map((item: any) => {
                // Handle different item types
                if (typeof item === 'string') return item;
                if (!item.str) return '';
                
                // Add newline if Y position changed significantly (new line)
                if (item.y && lastY !== -1 && Math.abs(item.y - lastY) > 5) {
                  lastY = item.y;
                  return '\n' + item.str;
                }
                lastY = item.y || lastY;
                return item.str;
              })
              .join(' ')
              .replace(/\s+/g, ' ') // Normalize spaces
              .trim();
          } catch (textError) {
            // Fallback: try rendering as images and extracting
            console.warn(`Text extraction failed for page ${pageNum}, attempting fallback:`, textError);
            
            // Try to get any available text from the page
            try {
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = typeof document !== 'undefined' 
                ? document.createElement('canvas') 
                : null;
              
              if (canvas) {
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d');
                if (context) {
                  await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    // @ts-ignore - Required in some versions but types might be inconsistent
                    canvas: canvas,
                  }).promise;
                  // For scanned PDFs, we'd need OCR here
                  pageText = `[Page ${pageNum} - Image-based PDF, text extraction not available]`;
                }
              }
            } catch {
              pageText = `[Page ${pageNum}]`;
            }
          }
          
          if (pageText.trim()) {
            text += pageText + '\n\n';
            pageCount++;
          }
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          // Continue with next page if one fails
        }
      }

      if (!text.trim() || pageCount === 0) {
        throw new Error(
          'Unable to extract text from PDF. This might be a scanned/image-based PDF. ' +
          'Please paste the syllabus content as text instead.'
        );
      }

      return text;
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? `PDF Error: ${error.message}` 
          : 'Failed to parse PDF. Please try a different PDF file or paste the content as text.'
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setFileError(null);

    try {
      if (file.type === 'application/pdf') {
        // Handle PDF files
        try {
          const text = await extractTextFromPDF(file);
          if (!text.trim()) {
            throw new Error('No text could be extracted from PDF');
          }
          setFileContent(`${file.name}`);
          setSyllabus(text);
        } catch (pdfError) {
          const errorMsg = pdfError instanceof Error ? pdfError.message : 'Failed to parse PDF';
          throw new Error(`PDF Error: ${errorMsg}`);
        }
      } else {
        // Handle text files (.txt, .doc, .docx)
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setFileContent(file.name);
          setSyllabus(content);
          setFileLoading(false);
        };
        reader.onerror = () => {
          setFileError('Failed to read file');
          setFileLoading(false);
        };
        reader.readAsText(file);
        return;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process file';
      setFileError(errorMsg);
      console.error('File upload error:', error);
    } finally {
      setFileLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabus.trim()) {
      alert('Please enter or upload a syllabus');
      return;
    }
    onSubmit(syllabus, skillLevel);
  };

  return (
    <div className='bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[40px] p-8 shadow-2xl shadow-purple-200/50'>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-xl">📁</div>
        <h2 className="text-2xl font-bold text-[#2d1b4e]">Input Syllabus</h2>
      </div>
      
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* File Upload */}
        <div className="bg-slate-50/50 border-2 border-dashed border-purple-200 rounded-3xl p-6 transition-all hover:border-purple-400 group">
          <label className='block text-sm font-bold text-[#2d1b4e] mb-3 uppercase tracking-wider'>
            Upload Syllabus File
          </label>
          <input
            type='file'
            accept='.txt,.pdf,.doc,.docx'
            onChange={handleFileUpload}
            disabled={fileLoading}
            className='block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 disabled:opacity-50 cursor-pointer'
          />
          {fileLoading && (
            <div className='mt-3 flex items-center gap-2 text-sm text-purple-600 font-medium'>
              <div className='w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin' />
              Extracting knowledge...
            </div>
          )}
          {fileError && (
            <div className='mt-3 text-sm text-red-500 font-medium flex items-center gap-2'>
              <span>❌</span> {fileError}
            </div>
          )}
        </div>

        {/* Text Area */}
        <div>
          <label className='block text-sm font-bold text-[#2d1b4e] mb-2 uppercase tracking-wider'>
            Or Paste Syllabus Text
          </label>
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            placeholder='Paste your course syllabus here...'
            className='w-full h-48 bg-white border-2 border-slate-100 rounded-3xl p-4 text-[#2d1b4e] placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all resize-none shadow-sm'
          />
        </div>

        {/* Skill Level */}
        <div>
          <label className='block text-sm font-bold text-[#2d1b4e] mb-2 uppercase tracking-wider'>
            Target Skill Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSkillLevel(level)}
                className={`py-3 px-2 rounded-2xl text-xs font-bold uppercase tracking-tighter transition-all ${
                  skillLevel === level 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                    : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-purple-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={loading || fileLoading}
          className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-5 px-6 rounded-[24px] transition-all duration-300 shadow-xl shadow-purple-200 flex items-center justify-center gap-3 active:scale-[0.98]'
        >
          {loading || fileLoading ? (
            <>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              <span>{fileLoading ? 'Reading File...' : 'Optimizing...'}</span>
            </>
          ) : (
            <>
              <span className="text-xl">🚀</span>
              <span>Generate Roadmap</span>
            </>
          )}
        </button>

        {/* Info Text */}
        {fileContent && !fileError && (
          <div className='text-xs text-green-600 bg-green-50 border border-green-100 rounded-2xl p-3 flex items-center gap-2 font-bold'>
            <span className="text-lg">✓</span> {fileContent} analyzed
          </div>
        )}
      </form>
    </div>
  );
}
