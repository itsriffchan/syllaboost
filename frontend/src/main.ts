import './index.css'
import jsPDF from 'jspdf'

interface ApiError {
  code: string
  message: string
  field?: string
}

interface Project {
  id: string
  title: string
  description: string
  difficulty: 'starter' | 'stretch'
  skillsUsed: string[]
  estimatedHours: number
  deliverable: string
  hints: string[]
}

interface WeekModule {
  weekNumber: number
  weekLabel: string
  topics: string[]
  learningOutcomes: string[]
  projects: Project[]
}

interface Roadmap {
  id: string
  courseTitle: string
  totalWeeks: number
  generatedAt: string
  weeks: WeekModule[]
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const app = document.getElementById('app') as HTMLDivElement

const state = {
  uploadMode: 'file' as 'file' | 'text',
  selectedFile: null as File | null,
  rawText: '',
  courseTitle: '',
}

function render() {
  const params = new URLSearchParams(window.location.search)
  const roadmapId = params.get('id')

  if (roadmapId) {
    renderRoadmapPage(roadmapId)
  } else {
    renderUploadPage()
  }
}

function renderUploadPage() {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-slate-900 mb-3">Syllaboost</h1>
          <p class="text-lg text-slate-600 mb-2">Upload your course syllabus and generate a weekly project roadmap.</p>
          <p class="text-slate-500">Supports PDF and DOCX files, or paste plain text directly.</p>
        </div>

        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button id="file-mode" class="w-full sm:w-auto px-5 py-3 rounded-full font-semibold transition ${state.uploadMode === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">Upload File</button>
            <button id="text-mode" class="w-full sm:w-auto px-5 py-3 rounded-full font-semibold transition ${state.uploadMode === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">Paste Text</button>
          </div>

          <div id="upload-area"></div>

          <div>
            <label for="course-title" class="block text-sm font-medium text-slate-700 mb-2">Course Title (Optional)</label>
            <input id="course-title" type="text" value="${escapeHtml(state.courseTitle)}" placeholder="e.g. Introduction to Python Programming" class="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm text-slate-500 mt-2">Leave blank to auto-detect from syllabus content.</p>
          </div>

          <button id="submit-button" class="w-full rounded-2xl py-4 text-white font-semibold bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50" disabled>Generate Roadmap</button>

          <div id="error-message" class="hidden rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"></div>
        </div>
      </div>
    </div>
  `

  const fileMode = document.getElementById('file-mode')!
  const textMode = document.getElementById('text-mode')!
  const uploadArea = document.getElementById('upload-area')!
  const courseTitle = document.getElementById('course-title') as HTMLInputElement
  const submitButton = document.getElementById('submit-button') as HTMLButtonElement
  const errorMessage = document.getElementById('error-message') as HTMLDivElement

  fileMode.addEventListener('click', () => setUploadMode('file'))
  textMode.addEventListener('click', () => setUploadMode('text'))

  courseTitle.addEventListener('input', (event) => {
    state.courseTitle = (event.target as HTMLInputElement).value
  })

  submitButton.addEventListener('click', handleSubmit)

  function setUploadMode(mode: 'file' | 'text') {
    state.uploadMode = mode
    state.selectedFile = null
    state.rawText = ''
    render()
  }

  function renderUploadArea() {
    if (state.uploadMode === 'file') {
      uploadArea.innerHTML = `
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <label for="file-input" class="cursor-pointer flex flex-col items-center justify-center gap-4 text-slate-700">
            <div class="h-16 w-16 rounded-3xl bg-white shadow flex items-center justify-center text-blue-600">📄</div>
            <span class="text-lg font-semibold">Drag & drop a PDF or DOCX file, or click to choose</span>
            <span class="text-sm text-slate-500">Max 10MB</span>
          </label>
          <input id="file-input" type="file" accept=".pdf,.docx" class="hidden" />
          <div id="file-details" class="mt-6 text-slate-600"></div>
        </div>
      `

      const fileInput = document.getElementById('file-input') as HTMLInputElement
      const fileDetails = document.getElementById('file-details')!

      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0] ?? null
        state.selectedFile = file
        if (file) {
          fileDetails.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`
        } else {
          fileDetails.textContent = ''
        }
        updateSubmitState()
      })
    } else {
      uploadArea.innerHTML = `
        <div class="space-y-3">
          <label for="raw-text" class="block text-sm font-medium text-slate-700">Paste Syllabus Content</label>
          <textarea id="raw-text" rows="10" class="w-full rounded-3xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste your course syllabus text here..."></textarea>
          <div class="flex items-center justify-between text-sm text-slate-500">
            <span id="char-count">0 characters</span>
            <span>Minimum 100 characters</span>
          </div>
        </div>
      `

      const rawText = document.getElementById('raw-text') as HTMLTextAreaElement
      const charCount = document.getElementById('char-count')!

      rawText.addEventListener('input', () => {
        state.rawText = rawText.value
        charCount.textContent = `${state.rawText.length} characters`
        updateSubmitState()
      })
    }

    updateSubmitState()
  }

  function updateSubmitState() {
    const valid = (state.uploadMode === 'file' && state.selectedFile !== null) ||
      (state.uploadMode === 'text' && state.rawText.trim().length >= 100)

    submitButton.disabled = !valid
    if (state.uploadMode === 'text') {
      const count = state.rawText.trim().length
      submitButton.textContent = count < 100 ? 'Paste more text to continue' : 'Generate Roadmap'
    } else {
      submitButton.textContent = 'Generate Roadmap'
    }
  }

  function showError(message: string) {
    errorMessage.textContent = message
    errorMessage.classList.remove('hidden')
  }

  function hideError() {
    errorMessage.classList.add('hidden')
  }

  async function handleSubmit() {
    hideError()
    submitButton.disabled = true
    submitButton.textContent = 'Generating roadmap...'

    try {
      const roadmap = await parseSyllabus()
      window.history.pushState({}, '', `?id=${roadmap.id}`)
      renderRoadmapPage(roadmap.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate roadmap.'
      showError(message)
      submitButton.disabled = false
      updateSubmitState()
    }
  }

  renderUploadArea()
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
}

async function parseSyllabus(): Promise<Roadmap> {
  const payload: Record<string, string> = {}

  if (state.selectedFile) {
    payload.fileBase64 = await fileToBase64(state.selectedFile)
    payload.mimeType = state.selectedFile.type || 'application/pdf'
    payload.fileName = state.selectedFile.name
  }
  if (state.rawText) {
    payload.rawText = state.rawText
  }
  if (state.courseTitle.trim()) {
    payload.courseTitle = state.courseTitle.trim()
  }

  const response = await fetch(`${apiBaseUrl}/api/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = await response.json()
  if (!response.ok || result.success === false) {
    const error = result.error as ApiError | undefined
    throw new Error(error?.message || 'Failed to generate roadmap')
  }

  const roadmap = result.data as Roadmap
  localStorage.setItem(`roadmap_${roadmap.id}`, JSON.stringify(roadmap))
  return roadmap
}

function renderRoadmapPage(id: string) {
  app.innerHTML = `
    <div class="min-h-screen bg-slate-50 pb-12">
      <header class="bg-white border-b shadow-sm">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button id="back-button" class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-100">← Back</button>
            <h1 class="text-3xl font-bold text-slate-900 mt-4 md:mt-0">Roadmap</h1>
          </div>
          <button id="export-button" class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Export PDF</button>
        </div>
      </header>
      <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="roadmap-content">
        <div class="text-center py-20 text-slate-500">Loading roadmap...</div>
      </main>
    </div>
  `

  const backButton = document.getElementById('back-button') as HTMLButtonElement
  backButton.addEventListener('click', () => {
    window.history.pushState({}, '', '/')
    renderUploadPage()
  })

  const exportButton = document.getElementById('export-button') as HTMLButtonElement
  exportButton.disabled = true

  fetchRoadmap(id)
    .then((roadmap) => {
      exportButton.disabled = false
      exportButton.addEventListener('click', () => exportRoadmapPDF(roadmap))
      showRoadmap(roadmap)
    })
    .catch((error) => {
      const content = document.getElementById('roadmap-content')!
      content.innerHTML = `
        <div class="rounded-3xl bg-white border border-red-200 p-8 text-center">
          <h2 class="text-2xl font-semibold text-slate-900 mb-4">Unable to load roadmap</h2>
          <p class="text-slate-600 mb-6">${escapeHtml(error.message || 'The roadmap could not be retrieved.')}</p>
          <button id="retry-button" class="rounded-full bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Try again</button>
        </div>
      `
      document.getElementById('retry-button')?.addEventListener('click', () => renderRoadmapPage(id))
    })
}

async function fetchRoadmap(id: string): Promise<Roadmap> {
  const stored = localStorage.getItem(`roadmap_${id}`)
  if (stored) {
    return JSON.parse(stored) as Roadmap
  }
  throw new Error('Roadmap not found. It may have expired or you are on a different device.')
}

function showRoadmap(roadmap: Roadmap) {
  const content = document.getElementById('roadmap-content')!
  content.innerHTML = `
    <div class="rounded-3xl bg-white p-8 shadow-sm">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-slate-900">${escapeHtml(roadmap.courseTitle)}</h2>
        <p class="mt-2 text-slate-600">${roadmap.totalWeeks} weeks • Generated ${new Date(roadmap.generatedAt).toLocaleDateString()}</p>
      </div>
      <div class="grid gap-6 lg:grid-cols-2">
        ${roadmap.weeks.map(renderWeekCard).join('')}
      </div>
    </div>
  `
}

function renderWeekCard(week: WeekModule) {
  return `
    <section class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-2xl font-semibold text-slate-900">${escapeHtml(week.weekLabel)}</h3>
        <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">Week ${week.weekNumber}</span>
      </div>
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-slate-700 mb-2">Topics</h4>
        <div class="flex flex-wrap gap-2">
          ${week.topics.map((topic) => `<span class="rounded-full bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">${escapeHtml(topic)}</span>`).join('')}
        </div>
      </div>
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-slate-700 mb-2">Learning Outcomes</h4>
        <ul class="list-disc list-inside text-slate-600 space-y-1">
          ${week.learningOutcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join('')}
        </ul>
      </div>
      <div class="space-y-4">
        ${week.projects.map(renderProjectCard).join('')}
      </div>
    </section>
  `
}

function renderProjectCard(project: Project) {
  const tagClasses = project.difficulty === 'starter'
    ? 'inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800'
    : 'inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800'

  return `
    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h5 class="text-xl font-semibold text-slate-900">${escapeHtml(project.title)}</h5>
          <p class="mt-2 text-slate-600">${escapeHtml(project.description)}</p>
        </div>
        <span class="${tagClasses}">${project.difficulty}</span>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-3xl bg-slate-50 p-4">
          <p class="text-sm font-semibold text-slate-700">Deliverable</p>
          <p class="mt-2 text-slate-600">${escapeHtml(project.deliverable)}</p>
        </div>
        <div class="rounded-3xl bg-slate-50 p-4">
          <p class="text-sm font-semibold text-slate-700">Estimated Hours</p>
          <p class="mt-2 text-slate-600">${project.estimatedHours} hours</p>
        </div>
      </div>
      <div class="mt-4">
        <p class="text-sm font-semibold text-slate-700 mb-2">Skills Used</p>
        <div class="flex flex-wrap gap-2">${project.skillsUsed.map((skill) => `<span class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">${escapeHtml(skill)}</span>`).join('')}</div>
      </div>
      <div class="mt-4">
        <p class="text-sm font-semibold text-slate-700 mb-2">Hints</p>
        <ul class="list-disc list-inside text-slate-600 space-y-1">
          ${project.hints.map((hint) => `<li>${escapeHtml(hint)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `
}

function exportRoadmapPDF(roadmap: Roadmap) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = 40

  pdf.setFontSize(22)
  pdf.text(roadmap.courseTitle, 40, y)
  y += 30
  pdf.setFontSize(12)
  pdf.text(`Total Weeks: ${roadmap.totalWeeks}`, 40, y)
  y += 15
  pdf.text(`Generated: ${new Date(roadmap.generatedAt).toLocaleDateString()}`, 40, y)
  y += 30

  roadmap.weeks.forEach((week) => {
    if (y > 720) {
      pdf.addPage()
      y = 40
    }

    pdf.setFontSize(16)
    pdf.text(week.weekLabel, 40, y)
    y += 20

    pdf.setFontSize(11)
    pdf.text('Topics:', 40, y)
    y += 16
    week.topics.forEach((topic) => {
      pdf.text(`• ${topic}`, 50, y)
      y += 14
    })
    y += 10

    week.projects.forEach((project) => {
      if (y > 700) {
        pdf.addPage()
        y = 40
      }
      pdf.setFontSize(13)
      pdf.text(`${project.title} (${project.difficulty})`, 40, y)
      y += 16
      pdf.setFontSize(11)
      const descriptionLines = pdf.splitTextToSize(project.description, 500)
      pdf.text(descriptionLines, 45, y)
      y += descriptionLines.length * 14
      y += 8
    })
    y += 20
  })

  const filename = roadmap.courseTitle.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase() || 'roadmap'
  pdf.save(`${filename}_roadmap.pdf`)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

render()
window.addEventListener('popstate', render)
