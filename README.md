# Syllaboost 🎓

**AI-Powered Syllabus-to-Weekly-Roadmap Generator**

Transform course syllabi into personalized weekly project roadmaps. Students upload a syllabus, and AI generates hands-on mini-projects aligned to each week's topics.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Project Overview

Syllaboost bridges the gap between passive learning and active building by:

- 📤 **Upload** course syllabi (PDF, DOCX, or plain text)
- 🤖 **Parse** syllabus content using Groq AI
- 📋 **Generate** a structured weekly project roadmap
- 📊 **Display** projects in a clean dashboard UI
- 📥 **Export** roadmap as PDF

### Key Features (v1.0)

- ✅ Syllabus upload (PDF/DOCX/text)
- ✅ AI-powered topic extraction
- ✅ Weekly project generation (1 starter + 1 stretch per week)
- ✅ Responsive dashboard UI
- ✅ PDF export
- ✅ Session-based storage (no database required)

### Out of Scope for v1.0

- User authentication
- Course marketplace integrations
- Progress tracking
- Community features
- Mobile app

---

## Tech Stack

### Frontend & Backend
- **Next.js** 16.x (React framework with API routes)
- **TypeScript** 5.x (type-safe development)
- **Tailwind CSS** 4.x (styling)
- **React** 19.x (UI library)

### AI & APIs
- **Groq API** (AI engine - llama-3.3-70b-versatile model)
- **pdf.js** (PDF parsing)

### Development Tools
- **ESLint** 9.x (code linting)
- **Node.js** 20 LTS (runtime)

---

## Prerequisites

Before you start, ensure you have:

- **Node.js** 20.x LTS or higher
- **npm** 9.x or higher
- **Git**
- **Groq API Key** (free at https://console.groq.com/)

Check your versions:
```bash
node --version    # v20.x.x
npm --version     # 9.x.x
git --version     # 2.x.x
```

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/itsriffchan/syllaboost.git
cd syllaboost
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Groq API key:

```
GROQ_API_KEY=your-actual-groq-api-key-here
```

Get your free Groq API key: https://console.groq.com/

---

## Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build the application:

```bash
npm run build
npm run start
```

### Linting

Check for code style issues:

```bash
npm run lint
```

---

## Project Structure

```
syllaboost/
├── app/
│   ├── api/
│   │   └── generate-roadmap/       # API route for roadmap generation
│   │       └── route.ts
│   ├── page.tsx                    # Main application page
│   ├── layout.tsx                  # Root layout component
│   └── globals.css                 # Global styles
├── components/
│   ├── SyllabusUpload.tsx          # File upload component
│   ├── RoadmapDisplay.tsx          # Roadmap display component
│   └── LoadingSpinner.tsx          # Loading indicator component
├── public/
│   ├── icon.png                    # App icon
│   └── logo.png                    # Logo image
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── .env.local                      # Environment variables (not committed)
├── .env.example                    # Environment template
└── README.md                       # This file
```

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Generate Roadmap
**POST** `/api/generate-roadmap`

Submit a syllabus and skill level to generate a learning roadmap.

**Request (JSON):**
```json
{
  "syllabus": "Course syllabus content or text here...",
  "skillLevel": "beginner|intermediate|advanced"
}
```

**Response (200 OK):**
```json
{
  "roadmap": {
    "courseName": "Introduction to Python",
    "skillLevel": "intermediate",
    "totalWeeks": 8,
    "overallSummary": "A comprehensive guide to Python programming...",
    "weeks": [
      {
        "week": 1,
        "title": "Variables & Data Types",
        "concepts": ["Variables", "Data Types", "Print Statement"],
        "projects": [
          {
            "name": "Personal Info Card",
            "description": "Build a CLI program that stores and displays your personal information.",
            "difficulty": "easy",
            "estimatedHours": 2
          }
        ],
        "exercises": ["Create 5 variables of different types"],
        "resources": ["Python Documentation", "W3Schools Python Tutorial"],
        "estimatedHoursPerWeek": 5
      }
    ],
    "recommendations": [
      {
        "type": "course",
        "title": "Python for Everybody",
        "description": "Free online course covering Python basics",
        "provider": "Coursera",
        "url": "https://coursera.org/..."
      }
    ]
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Invalid request",
  "details": "Syllabus text is required"
}
```

---

## Environment Variables

Create a `.env.local` file in the root directory with the following:

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Groq API key (free at https://console.groq.com/) |

Get your free API key: https://console.groq.com/

---

## Development Guidelines

### Code Style

- **Naming Conventions:**
  - Variables & functions: `camelCase`
  - React components: `PascalCase`
  - API routes: `/api/kebab-case`
  - Environment vars: `SCREAMING_SNAKE_CASE`

- **File Organization:**
  - React components: `components/ComponentName.tsx`
  - API routes: `app/api/route-name/route.ts`
  - Global styles: `app/globals.css`

### TypeScript

- Use strict typing for all functions and components
- Define interfaces for data structures
- Avoid `any` types

### Commit Format

```
type(scope): message

Examples:
feat(components): add LoadingSpinner component
fix(api): handle empty syllabus text
docs(readme): update setup instructions
```

---

## Troubleshooting

### Issue: `GROQ_API_KEY is not defined`
**Solution:** Create `.env.local` in the root directory
```bash
GROQ_API_KEY=your_actual_api_key_here
```

### Issue: `Module not found` error
**Solution:** Install dependencies
```bash
npm install
```

### Issue: Build fails with TypeScript errors
**Solution:** Check for type errors
```bash
npm run lint
```

### Issue: Port 3000 already in use (on Windows)
**Solution:** Kill the process or use a different port
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Then kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or specify a different port
PORT=3001 npm run dev
```

---

## Contributing

1. **Create** a feature branch: `git checkout -b feature/description`
2. **Make** your changes with clear commits
3. **Push** to your fork: `git push origin feature/description`
4. **Create** a pull request with description
5. **Address** any feedback and merge when approved

### Before Submitting

- Run `npm run lint` to check code style
- Test your changes locally
- Update README if needed
- Keep commits small and focused

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Groq API Documentation](https://console.groq.com/docs/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

---

## Support

For questions or issues:
1. Check this README
2. Search existing GitHub issues
3. Create a new issue with details

---

## License

MIT License - See LICENSE file for details

---

**Happy coding! 🚀**
