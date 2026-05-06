# SyllabusAI 🎓

**Syllabus-to-Weekly-Roadmap Web Application**

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

SyllabusAI bridges the gap between passive learning and active building by:
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b

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

### Frontend
- **TypeScript** (type-safe vanilla JS)
- **Vite** 5.x (build tool)
- **Tailwind CSS** 3.x (styling)
- **jsPDF** 2.x (PDF export)

### Backend
- **Node.js** 20 LTS
- **Express** 5.x
- **Groq API** (AI engine - llama-3.3-70b-versatile)
- **pdf-parse** + **Mammoth** (file parsing)
- **CORS** (cross-origin requests)
- **UUID** (unique ID generation)

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
git clone https://github.com/itsriffchan/devweek-hackathon.git
cd devweek-hackathon
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend  # or from root: cd frontend
npm install
```

### 3. Set Up Environment Variables

#### Backend (`.env.local`)
Copy `.env.example` to `.env.local` and fill in your Groq API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
GROQ_API_KEY=your-actual-groq-api-key-here
PORT=3001
```

Get your free Groq API key: https://console.groq.com/

#### Frontend
No additional environment variables needed. The frontend will automatically connect to the backend at `http://localhost:3001`.

---

## Running the Project

### Option 1: Run Backend & Frontend Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
npm install
npm run dev
```
Server will start at `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
App will be available at `http://localhost:5173`

### Option 2: Run Backend Only (to test API)

```bash
npm install
npm run dev
```

Test the API:
```bash
# Health check
curl http://localhost:3001/api/health
```

### Option 3: Start Backend (for Production)

```bash
npm install
npm start
```

---

## Project Structure

```
devweek-hackathon/
├── README.md
├── docs/
│   └── SYSTEM_DESIGN.md               # Complete system design document
├── frontend/
│   ├── src/
│   │   ├── main.ts                    # TypeScript entry point
│   │   ├── index.css                  # Tailwind styles
│   │   └── vite-env.d.ts              # Vite type definitions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server.js                          # Express backend entry point
├── package.json                       # Backend dependencies
├── .env.local                         # Environment variables (not committed)
├── .env.example                       # Environment template
└── .gitignore
```

---

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### 1. Parse Syllabus
**POST** `/api/parse`

Upload a syllabus (PDF, DOCX, or text) and get a generated roadmap.

**Request (JSON):**
```json
{
  "fileBase64": "base64-encoded-file-content",
  "mimeType": "application/pdf",
  "fileName": "syllabus.pdf",
  "courseTitle": "Introduction to Python"
}
```

Or for plain text:
```json
{
  "rawText": "Course syllabus content here...",
  "courseTitle": "Introduction to Python"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "courseTitle": "Introduction to Python",
    "totalWeeks": 8,
    "generatedAt": "2026-05-06T10:30:00Z",
    "weeks": [
      {
        "weekNumber": 1,
        "weekLabel": "Week 1: Variables & Data Types",
        "topics": ["Variables", "Data Types", "Print Statement"],
        "learningOutcomes": ["Declare variables", "Use basic data types"],
        "projects": [
          {
            "id": "proj_week1_starter",
            "title": "Personal Info Card",
            "description": "Build a CLI program that stores and displays your personal information.",
            "difficulty": "starter",
            "skillsUsed": ["Variables", "Input/Output", "String Formatting"],
            "estimatedHours": 2,
            "deliverable": "A Python script that runs in the terminal",
            "hints": ["Use input() to get user data", "Use print() to display it"]
          }
        ]
      }
    ]
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Syllabus text must be at least 100 characters"
  }
}
```

#### 2. Retrieve Roadmap
**GET** `/api/roadmap/:id`

Get a previously generated roadmap by ID (stored in session).

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* roadmap object */ }
}
```

#### 3. Health Check
**GET** `/api/health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "SyllabusAI backend is running"
}
```

---

## Environment Variables

### Backend (`.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ | - | Groq API key (free at https://console.groq.com/) |
| `PORT` | ❌ | 3001 | Server port |

---

## Development Guidelines

### Code Style

- **Naming Conventions:**
  - Variables & functions: `camelCase`
  - React components: `PascalCase`
  - API routes: `/api/kebab-case`
  - Environment vars: `SCREAMING_SNAKE_CASE`

- **File Organization:**
  - Backend services: `name.service.js`
  - Middleware: `name.middleware.js`
  - Frontend components: `ComponentName.jsx`

### Commit Format

```
type(scope): message

Examples:
feat(backend): add PDF parsing service
fix(api): handle empty syllabus text
docs(readme): update installation steps
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make commits: `git commit -m "type(scope): message"`
3. Push branch: `git push origin feature/description`
4. Create pull request on GitHub
5. Request review, address feedback, merge when approved

---

## Testing

### Backend Unit Tests
```bash
cd backend
npm test
```

### Backend Integration Tests
```bash
cd backend
npm run test:integration
```

### Frontend Component Tests
```bash
cd frontend
npm test
```

### E2E Tests (Coming Soon)
```bash
npm run test:e2e
```

---

## Troubleshooting

### Issue: `Cannot find package 'express'`
**Solution:** Install dependencies
```bash
npm install
```

### Issue: `GROQ_API_KEY is not defined`
**Solution:** Create `.env.local` and add your API key
```bash
cp .env.example .env.local
# Edit .env.local with your actual Groq API key from https://console.groq.com/
```

### Issue: `Port 3001 already in use`
**Solution:** Change the port
```bash
# In .env.local:
PORT=3002
# Or kill the process using the port (macOS/Linux)
lsof -ti:3001 | xargs kill -9
```

### Issue: `CORS error when calling backend from frontend`
**Solution:** Ensure frontend is running on `http://localhost:5173`
```bash
cd frontend
npm run dev  # This starts on port 5173 by default
```

### Issue: `File upload fails`
**Solution:** Check file size and format
- Ensure file is PDF or DOCX
- File content must be at least 100 characters
- Check backend logs for specific error

---

## Contributing

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** locally
6. **Commit** with clear messages
7. **Push** to your fork
8. **Create** a pull request

### Pull Request Guidelines

- Clear title and description
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Request review from team

---

## Resources

- [System Design Document](./docs/SYSTEM_DESIGN.md) — Complete architecture & specs
- [Groq API Documentation](https://console.groq.com/docs/)
- [Express.js Guide](https://expressjs.com)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## Support

For questions or issues:
1. Check this README & SYSTEM_DESIGN.md
2. Search existing GitHub issues
3. Create a new issue with details
4. Ask in team chat/discussions

---

## License

MIT License - See LICENSE file for details

---

**Happy coding! 🚀**

---

## Git Workflow

* Do not push directly to `main`
* Create a new branch for changes:

```bash id="b9kq2x"
git checkout -b feature/branch-name
```

* Commit changes:

```bash id="z7m1vd"
git add .
git commit -m "feat: description"
```

* Push branch:

```bash id="n4c8yx"
git push origin feature/branch-name
```

* Open a pull request to `main`

---

## Commit Conventions

* `feat:` new feature
* `fix:` bug fix
* `docs:` documentation
* `refactor:` code changes without feature updates

---

## Security Notes

Do not upload:

* `.env.local`
* API keys or secrets

Ensure `.gitignore` includes:

```id="h2p6qa"
node_modules
.env.local
.env
dist
build
```

---

## Common Issues

If dependencies break:

```bash id="s5d1we"
rm -rf node_modules
npm install
```

---

## Notes

Keep changes small, clear, and coordinated through pull requests.
