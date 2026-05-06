<<<<<<< HEAD
# SyllabusAI 🎓
=======
# Syllaboost🎓
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b

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

<<<<<<< HEAD
SyllabusAI bridges the gap between passive learning and active building by:
=======
Syllaboost bridges the gap between passive learning and active building by:
>>>>>>> d0429953a4f8fa2abe29c23f912647d6ead7797b

- 📤 **Upload** course syllabi (PDF, DOCX, or plain text)
- 🤖 **Parse** syllabus content using Google Gemini AI
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
- **React** 18.x
- **Vite** 5.x (build tool)
- **Tailwind CSS** 3.x (styling)
- **React Query** 5.x (state management)
- **React Router** 6.x (routing)
- **jsPDF** 2.x (PDF export)

### Backend
- **Node.js** 20 LTS
- **Express** 5.x
- **Google Gemini API** (AI engine)
- **Multer** 1.x (file uploads)
- **pdf-parse** + **Mammoth** (file parsing)
- **Zod** 3.x (validation)
- **express-session** (session management)

---

## Prerequisites

Before you start, ensure you have:

- **Node.js** 20.x LTS or higher
- **npm** 9.x or higher
- **Git**
- **Google Gemini API Key** (free at https://aistudio.google.com/app/apikey)

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
Copy `.env.example` to `.env.local` and fill in your API key:

```bash
cd backend
cp .env.example .env.local
```

Edit `.env.local`:
```
GOOGLE_API_KEY=your-actual-google-api-key-here
PORT=3001
NODE_ENV=development
SESSION_SECRET=your-secret-key-min-32-characters-long
FRONTEND_URL=http://localhost:5173
GEMINI_MODEL=gemini-1.5-pro
```

Get your free Google Gemini API key: https://aistudio.google.com/app/apikey

#### Frontend (`.env.local`)
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

---

## Running the Project

### Option 1: Run Backend & Frontend Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server will start at `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App will be available at `http://localhost:5173`

### Option 2: Run Backend Only (to test API)

```bash
cd backend
npm run dev
```

Test the API:
```bash
# Health check
curl http://localhost:3001/api/health
```

### Option 3: Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm preview
```

---

## Project Structure

```
devweek-hackathon/
├── README.md
├── docs/
│   └── SYSTEM_DESIGN.md          # Complete system design document
├── backend/
│   ├── src/
│   │   ├── routes/               # API endpoints
│   │   │   ├── parse.route.js
│   │   │   ├── roadmap.route.js
│   │   │   └── health.route.js
│   │   ├── services/             # Business logic
│   │   │   ├── fileParser.service.js
│   │   │   ├── gemini.service.js
│   │   │   ├── validator.service.js
│   │   │   └── roadmap.service.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── upload.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── utils/                # Utilities
│   │   │   ├── logger.js
│   │   │   └── constants.js
│   │   ├── app.js                # Express app
│   │   └── server.js             # Server entry point
│   ├── package.json
│   ├── .env                      # Default environment variables
│   ├── .env.example              # Environment template
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page routes
│   │   ├── services/             # API calls
│   │   ├── hooks/                # Custom hooks
│   │   └── App.jsx
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
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

Upload a syllabus and get a generated roadmap.

**Request:**
```bash
curl -X POST http://localhost:3001/api/parse \
  -F "file=@syllabus.pdf" \
  -F "courseTitle=Introduction to Python" \
  -F "totalWeeks=8"
```

**Response (200 OK):**
```json
{
  "success": true,
  "roadmap": {
    "id": "uuid-v4",
    "courseTitle": "Introduction to Python",
    "totalWeeks": 8,
    "generatedAt": "2026-05-06T10:30:00Z",
    "weeks": [
      {
        "weekNumber": 1,
        "weekLabel": "Week 1",
        "topics": ["Variables", "Data Types"],
        "learningOutcomes": ["Declare variables", "Use data types"],
        "projects": [
          {
            "id": "uuid-v4",
            "title": "Personal Info Card",
            "description": "Build a CLI program...",
            "difficulty": "starter",
            "skillsUsed": ["Variables", "Input/Output"],
            "estimatedHours": 1,
            "deliverable": "A Python script...",
            "hints": ["Use input()...", "Use print()..."]
          },
          {
            "id": "uuid-v4",
            "title": "Simple Calculator",
            "description": "Build a basic calculator...",
            "difficulty": "stretch",
            "skillsUsed": ["Variables", "Operators"],
            "estimatedHours": 2,
            "deliverable": "A Python script...",
            "hints": ["Convert strings to float...", "Use variables..."]
          }
        ]
      }
    ]
  }
}
```

**Error Responses (400, 422, 500):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PDF and Word (.docx) files are accepted.",
    "field": "file"
  }
}
```

#### 2. Retrieve Roadmap
**GET** `/api/roadmap/:id`

Get a previously generated roadmap by session ID.

**Response (200 OK):**
```json
{
  "success": true,
  "roadmap": { /* same structure as above */ }
}
```

#### 3. Health Check
**GET** `/api/health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-06T10:30:00Z"
}
```

---

## Environment Variables

### Backend (`.env` / `.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | ✅ | - | Google Gemini API key (free tier) |
| `PORT` | ❌ | 3001 | Server port |
| `NODE_ENV` | ❌ | development | `development` or `production` |
| `SESSION_SECRET` | ✅ | - | Min 32 characters for session signing |
| `FRONTEND_URL` | ❌ | http://localhost:5173 | CORS origin (frontend URL) |
| `MAX_FILE_SIZE_MB` | ❌ | 10 | Max upload size in MB |
| `GEMINI_MODEL` | ❌ | gemini-1.5-pro | Gemini model version |
| `GEMINI_MAX_TOKENS` | ❌ | 4096 | Max tokens in Gemini response |
| `GEMINI_TEMPERATURE` | ❌ | 0.3 | Temperature for response consistency |

### Frontend (`.env` / `.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ❌ | http://localhost:3001 | Backend API base URL |

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
cd backend
npm install
```

### Issue: `GOOGLE_API_KEY is not defined`
**Solution:** Create `.env.local` and add your API key
```bash
cp .env.example .env.local
# Edit .env.local with your actual API key
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
**Solution:** Ensure FRONTEND_URL matches your frontend URL
```bash
# .env.local should have:
FRONTEND_URL=http://localhost:5173
```

### Issue: `File upload fails`
**Solution:** Check file size and format
- Ensure file is PDF or DOCX
- File size must be under 10MB
- Check `MAX_FILE_SIZE_MB` in `.env.local`

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
- [Google Gemini API Docs](https://ai.google.dev/)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Vite Docs](https://vitejs.dev)

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
