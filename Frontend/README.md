# 🦕 DinoMate — Frontend (React + Vite)

[![Live Demo](https://img.shields.io/badge/Vercel-Live%20App-black?style=for-the-badge&logo=vercel)](https://dino-mate-jar4.vercel.app/)
[![Backend API](https://img.shields.io/badge/Render-API%20Backend-46E3B7?style=for-the-badge&logo=render)](https://dinomate.onrender.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

The modern, responsive frontend application for the **DinoMate** job marketplace and 150+ platform aggregator, built with **React 18**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Live Application

- **Production URL**: [https://dino-mate-jar4.vercel.app/](https://dino-mate-jar4.vercel.app/)
- **Backend API**: [https://dinomate.onrender.com/](https://dinomate.onrender.com/)
- **Backend Health Check**: [https://dinomate.onrender.com/health](https://dinomate.onrender.com/health)

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM 6
- **HTTP & Cache**: Axios + SWR Client-Side In-Memory/Local Cache
- **Form Management**: Formik + Yup
- **Icons & UI**: React Icons, SweetAlert2, React Toastify

---

## 💻 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
cd Frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `Frontend/` root directory:
```env
# Point to local Spring Boot backend or Render production backend
VITE_API_URL=http://localhost:8080
```

To connect directly to production backend:
```env
VITE_API_URL=https://dinomate.onrender.com
```

### 4. Run Development Server
```bash
npm run dev
```
The app will be running at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 📦 Deployment on Vercel

The application is configured with `vercel.json` for seamless client-side single-page application (SPA) routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Deploy via Vercel CLI or connect your GitHub repository directly to Vercel. Set `VITE_API_URL=https://dinomate.onrender.com` in your Vercel Project Environment Variables.
