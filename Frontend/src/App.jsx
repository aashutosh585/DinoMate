// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Navbar from './components/navbar/Navbar';
import AuthModal from './modals/AuthModal';
import { ToastContainer } from 'react-toastify';
import Jobs from './pages/Jobs';
import ApplyPage from './pages/ApplyPage'; 
import 'react-toastify/dist/ReactToastify.css';
import MyJobsPage from './pages/MyJobsPage';
import JobSeekerProfilePage from './pages/JobSeekerProfilePage';
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";
import NotificationToastManager from './components/NotificationToastManager';
import RequireRole from './components/RequireRole';
import ErrorBoundary from './components/ErrorBoundary';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerJobsPage from './pages/EmployerJobsPage';
import EmployerJobDetailsPage from './pages/EmployerJobDetailsPage';
import CreateJobPage from "./pages/CreateJobPage";
import UpdateJobPage from "./pages/UpdateJobPage";
import EmployerApplicantsPage from "./pages/EmployerApplicantsPage";
import ApplicationDetailsEmployerPage from "./pages/ApplicationDetailsEmployerPage";
import DinoAggregatorPage from "./pages/DinoAggregatorPage";
import JobApplicantsPage from "./pages/JobApplicantsPage";

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <Router>
      <Navbar
        onOpenAuth={() => setShowAuthModal(true)}
      />

      <ToastContainer position="top-center" autoClose={2000} pauseOnHover />
      <NotificationToastManager />

      <ErrorBoundary>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/aggregator" element={<DinoAggregatorPage />} />

        {/* Job Seeker Protected Routes */}
        <Route path="/myjobs" element={
          <RequireRole role="JOB_SEEKER">
            <MyJobsPage />
          </RequireRole>
        } />
        <Route path="/apply/:jobId" element={
          <RequireRole role="JOB_SEEKER">
            <ApplyPage />
          </RequireRole>
        } />
        <Route path="/profile" element={
          <RequireRole role="JOB_SEEKER">
            <JobSeekerProfilePage />
          </RequireRole>
        } />
        <Route path="/applications/:id" element={
          <RequireRole role="JOB_SEEKER">
            <ApplicationDetailsPage />
          </RequireRole>
        } />
        {/* Employer Protected Routes */}
        <Route path="/dashboard" element={
          <RequireRole role="EMPLOYER">
            <EmployerDashboard />
          </RequireRole>
        } />
        <Route path="/employer/jobs" element={
          <RequireRole role="EMPLOYER">
            <EmployerJobsPage />
          </RequireRole>
        } />
        <Route path="/employer/jobs/:jobId" element={
          <RequireRole role="EMPLOYER">
            <EmployerJobDetailsPage />
          </RequireRole>
        } />
        <Route path="/create-job" element={
          <RequireRole role="EMPLOYER">
            <CreateJobPage />
          </RequireRole>
        } />
        <Route path="/employer/jobs/update/:jobId" element={
          <RequireRole role="EMPLOYER">
            <UpdateJobPage />
          </RequireRole>
        } />
        <Route path="/employer/applicants" element={
          <RequireRole role="EMPLOYER">
            <EmployerApplicantsPage />
          </RequireRole>
        } />
        <Route path="/employer/jobs/:jobId/applicants" element={
          <RequireRole role="EMPLOYER">
            <JobApplicantsPage />
          </RequireRole>
        } />
        <Route path="/employer/applications/:id" element={
          <RequireRole role="EMPLOYER">
            <ApplicationDetailsEmployerPage />
          </RequireRole>
        } />

        </Routes>
      </ErrorBoundary>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </Router>
  );
}

export default App;
