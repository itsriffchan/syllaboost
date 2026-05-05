# Project Setup & Collaboration Guide

Quick guide for setting up and contributing to this project.

---

## Requirements (Possible dependencies na gagamitin natin)

* Node.js
* npm
* Git

---

## Local Setup

### 1. Clone the repository

```bash id="q1k8mp"
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install dependencies

```bash id="m0v2ls"
npm install
```

### 3. Environment variables

Create a `.env.local` file in the root directory:

```id="c8n4ad"
API_KEY=your_api_key_here
```

Do not commit this file.

### 4. Run the project

```bash id="t6xw9q"
npm run dev
```

or

```bash id="p3rj7s"
npm start
```

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
