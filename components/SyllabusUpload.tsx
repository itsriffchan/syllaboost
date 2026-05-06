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
    <div className='bg-slate-800/40 backdrop-blur border border-purple-500/30 rounded-lg p-6 shadow-xl'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* File Upload */}
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Upload Syllabus File
          </label>
          <input
            type='file'
            accept='.txt,.pdf,.doc,.docx'
            onChange={handleFileUpload}
            disabled={fileLoading}
            className='block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50 cursor-pointer'
          />
          {fileLoading && (
            <div className='mt-2 flex items-center gap-2 text-sm text-purple-300'>
              <div className='w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full animate-spin' />
              Parsing file...
            </div>
          )}
          {fileError && (
            <div className='mt-2 text-sm text-red-300'>Error: {fileError}</div>
          )}
        </div>

        {/* Text Area */}
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Or Paste Syllabus Here
          </label>
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            placeholder='Paste your course syllabus here (e.g., "Week 1: Introduction to JavaScript, basic syntax, variables...")'
            className='w-full h-40 bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none'
          />
        </div>

        {/* Skill Level */}
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Your Skill Level
          </label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className='w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
          >
            <option value='beginner'>Beginner</option>
            <option value='intermediate'>Intermediate</option>
            <option value='advanced'>Advanced</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={loading || fileLoading}
          className='w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2'
        >
          {loading || fileLoading ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              {fileLoading ? 'Parsing...' : 'Generating...'}
            </>
          ) : (
            'Generate Roadmap'
          )}
        </button>

        {/* Info Text */}
        {fileContent && !fileError && (
          <div className='text-sm text-green-400 bg-green-900/20 border border-green-500/30 rounded p-2'>
            ✓ {fileContent} loaded successfully
          </div>
        )}
      </form>
    </div>
  );
}
