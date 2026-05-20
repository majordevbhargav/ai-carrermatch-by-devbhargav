# HireFlow AI — Master Prompt for Bolt.new

Build a premium full-stack AI-powered SaaS web application called **HireFlow AI** — an AI Resume & Job Match Assistant that helps users optimize resumes, analyze job compatibility, prepare for interviews, and track applications.

The application should feel like a modern startup product similar to LinkedIn Premium, Teal, or Jobscan with beautiful UI, smooth animations, responsive layouts, scalable architecture, and production-ready code.

---

# Tech Stack

## Frontend

* React + Vite
* Tailwind CSS
* React Router
* Framer Motion
* Recharts
* React Hook Form
* Lucide React Icons
* shadcn/ui components

## Backend & Database

* Firebase Authentication
* Firestore Database
* Firebase Storage

## AI Integration

* OpenAI API

## Deployment

* Vercel-ready deployment

---

# Core Application Requirements

## 1. Authentication System

Build a secure authentication flow using Firebase Authentication.

Features:

* Email/password signup
* Login/logout
* Forgot password
* Protected routes
* Persistent authentication state
* User profile section
* Profile avatar
* Responsive auth pages
* Animated transitions

Pages:

* Login Page
* Signup Page
* Forgot Password Page

---

# 2. Landing Page

Create a modern SaaS landing page.

Sections:

* Hero section
* Features section
* AI capabilities section
* Testimonials
* Pricing cards
* FAQ section
* CTA banner
* Footer

Design Style:

* Glassmorphism
* Gradient backgrounds
* Modern typography
* Smooth animations
* Premium startup feel

---

# 3. Main Dashboard

Create a modern dashboard layout.

Features:

* Sidebar navigation
* Top navbar
* User profile dropdown
* Search bar
* Notifications
* Dark/light mode toggle
* Mobile responsive layout

Sidebar Items:

* Dashboard
* Resume Analyzer
* Cover Letter Generator
* Interview Prep
* Job Tracker
* Analytics
* Settings

---

# 4. Resume Upload & Parsing

Build a resume upload system.

Features:

* Drag-and-drop upload
* Upload PDF/DOC/DOCX files
* Store resumes in Firebase Storage
* Extract resume text automatically
* Display parsed content
* Resume preview card
* Upload progress indicator
* File validation

Create reusable upload components.

---

# 5. AI Job Match Analyzer

Users can paste a job description.

The AI should:

* Analyze ATS compatibility score
* Highlight matching skills
* Highlight missing skills
* Suggest resume improvements
* Estimate hiring probability
* Generate optimized resume summary
* Recommend keywords
* Suggest stronger project descriptions

Display results using:

* Animated score cards
* Progress bars
* Skill chips
* Charts and analytics
* Expandable recommendations

---

# 6. AI Cover Letter Generator

Generate personalized cover letters using:

* User resume
* Job description
* Selected tone

Features:

* Editable text area
* Copy button
* Download as PDF
* Save history
* Multiple templates

Add:

* Professional template
* Startup template
* Corporate template

---

# 7. AI Interview Preparation

Generate interview preparation content.

Features:

* Technical questions
* HR questions
* Behavioral questions
* AI-generated answers
* Difficulty levels
* Mock interview mode
* Save interview sets

Display:

* Accordion layout
* Interactive cards
* Practice dashboard

---

# 8. Job Application Tracker

Users should be able to:

* Save jobs
* Track application status
* Add deadlines
* Add interview dates
* Add notes
* Filter/search jobs
* Sort by status

Statuses:

* Applied
* Interview
* Rejected
* Offer
* Saved

Create:

* Kanban board view
* Table view
* Analytics charts

---

# 9. Analytics Dashboard

Create beautiful analytics.

Charts:

* Applications sent
* Interview rate
* Offer rate
* ATS score trends
* Weekly activity

Use Recharts.

Include:

* Animated charts
* Statistics cards
* Activity timeline

---

# 10. AI Transparency Section

Add a section explaining:

“This app was developed using AI-assisted development workflows with ChatGPT and GitHub Copilot for UI generation, debugging, architecture planning, API integration, and productivity enhancement.”

---

# 11. UI/UX Requirements

The app must have:

* Modern SaaS UI
* Glassmorphism cards
* Responsive design
* Dark/light mode
* Smooth transitions
* Framer Motion animations
* Loading skeletons
* Toast notifications
* Hover effects
* Elegant gradients
* Premium typography
* Mobile-first responsiveness

---

# 12. Additional Features

Add:

* Export analysis as PDF
* Activity feed
* Resume history
* AI suggestions panel
* Search and filters
* Bookmark jobs
* Favorite resumes
* Recent activity widget
* Notification center

---

# 13. Folder Structure

Use clean scalable architecture:

src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── firebase/
├── context/
├── utils/
├── data/
├── styles/
├── assets/
└── types/

---

# 14. Firebase Integration

Include complete Firebase setup.

Implement:

* Firebase config
* Authentication logic
* Firestore collections
* Storage upload functions
* Security rules
* Reusable Firebase services

Firestore Collections:

* users
* resumes
* applications
* analyses
* coverLetters
* interviewSets

---

# 15. OpenAI Integration

Create reusable AI service functions for:

* ATS analysis
* Resume optimization
* Cover letter generation
* Interview question generation
* Skill extraction
* Resume scoring

Use modular service architecture.

---

# 16. Settings Page

Allow users to:

* Update profile
* Change password
* Manage resumes
* Toggle theme
* Delete account
* Configure AI preferences

---

# 17. README File

Generate the following professional README.md:

---

# HireFlow AI

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
git clone https://github.com/yourusername/hireflow-ai.git
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
