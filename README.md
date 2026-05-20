# CARRER MATCH AI

AI-Powered Resume & Job Match Assistant

HireFlow AI is a modern AI-powered SaaS platform designed to help users optimize resumes, analyze job compatibility, prepare for interviews, and track job applications efficiently.

The platform leverages OpenAI APIs, Firebase services, and a modern React frontend to create a premium career assistant experience.

---

## Features

### Authentication

* Secure Firebase Authentication
* Login / Signup / Forgot Password
* Protected routes
* Persistent sessions

### Resume Analyzer

* Upload PDF/DOC/DOCX resumes
* AI-powered ATS score analysis
* Resume parsing and skill extraction
* Improvement suggestions
* Hiring probability estimation

### AI Job Match Analysis

* Compare resumes against job descriptions
* Highlight matching skills
* Identify missing keywords
* Generate optimized resume summaries

### AI Cover Letter Generator

* Personalized cover letter generation
* Multiple templates
* Copy & PDF export support

### Interview Preparation

* Technical interview questions
* HR interview questions
* Behavioral interview preparation
* AI-generated answers

### Application Tracker

* Track job applications
* Add deadlines and interview dates
* Save notes
* Kanban and table views

### Analytics Dashboard

* Application analytics
* Interview success tracking
* ATS score trends
* Activity monitoring

### Modern UI/UX

* Glassmorphism design
* Dark/light mode
* Responsive layout
* Framer Motion animations
* Toast notifications
* Skeleton loading states

---

## Tech Stack

### Frontend

* React + Vite
* Tailwind CSS
* React Router
* Framer Motion
* shadcn/ui
* Recharts

### Backend & Database

* Firebase Authentication
* Firestore Database
* Firebase Storage

### AI Integration

* OpenAI API

### Deployment

* Vercel

---

## Folder Structure

src/
├── assets/
├── components/
├── context/
├── firebase/
├── hooks/
├── layouts/
├── pages/
├── services/
├── styles/
├── types/
├── utils/
└── data/

---

## Environment Variables

Create a `.env` file in the root directory.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_OPENAI_API_KEY=
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/majordevbhargav/ai-carrermatch-by-devbhargav
cd hireflow-ai
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

---

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication
3. Enable Firestore Database
4. Enable Firebase Storage
5. Add Firebase config to `.env`

---

## OpenAI Integration

1. Create an OpenAI account
2. Generate an API key
3. Add the API key to `.env`

AI Features:

* ATS scoring
* Resume optimization
* Cover letter generation
* Interview preparation
* Skill analysis

---

## Deployment

### Deploy on Vercel

```bash
npm run build
```

Push the project to GitHub and import it into Vercel.

---

## Screenshots

Add screenshots here:

* Landing Page
* Dashboard
* Resume Analyzer
* Analytics Page
* Job Tracker

---

## AI-Assisted Development

This application was developed using AI-assisted workflows with ChatGPT and GitHub Copilot for:

* UI generation
* Debugging
* API integration
* Architecture planning
* Productivity enhancement

---

## Future Improvements

* AI mock interviews
* Resume templates marketplace
* LinkedIn integration
* Chrome extension
* Real-time recruiter feedback
* AI career roadmap generation

---

## License

MIT License

---

## Author

Built with ❤️ using React, Firebase, and OpenAI.

---

# 18. Environment Variables

Use:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_OPENAI_API_KEY=

---

# 19. Deployment Preparation

Prepare the project for:

* One-click Vercel deployment
* Production build optimization
* SEO-friendly structure
* Fast loading performance

---

# 20. Final Output Requirements

Generate:

* Complete frontend
* Firebase backend integration
* OpenAI integration
* Responsive layouts
* Reusable components
* Clean scalable architecture
* Fully functional dashboard
* Production-ready code
* Modern animations
* Premium UI design

The final application should look and feel like a real funded startup SaaS product with polished UI, modern UX, scalable architecture, reusable code, and fully working AI-powered features.
