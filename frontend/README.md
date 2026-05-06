# SyllabusAI Frontend

A vanilla TypeScript frontend for SyllabusAI that allows users to upload course syllabi and generate personalized weekly project roadmaps.

## Tech Stack

- **Plain TypeScript** - UI logic and behavior
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **jsPDF** - PDF export

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── index.css            # Tailwind imports and global styles
├── main.ts              # Vanilla TypeScript frontend entry point
└── vite-env.d.ts        # Vite ambient type declarations
```

## Features

- **File Upload**: Upload PDF or DOCX files, or paste syllabus text
- **AI Integration**: Calls backend `/api/parse` and `/api/roadmap/:id`
- **Roadmap Display**: Renders a clean weekly roadmap UI in the browser
- **PDF Export**: Download the generated roadmap as a PDF
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Handles API and validation errors gracefully

## API Integration

The frontend communicates with the backend API at `/api/parse` and `/api/roadmap/:id`. Make sure the backend is running and the `VITE_API_BASE_URL` environment variable is set correctly.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.