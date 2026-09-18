import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api/config';

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [role, setRole] = useState('JOB_SEEKER'); // 'JOB_SEEKER' or 'EMPLOYER'
  const [resume, setResume] = useState(null);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });
  const [signingIn, setSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleSignupChange = (e) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSigninChange = (e) => {
    setSigninData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const endpoint = role === 'JOB_SEEKER' ? '/auth/signup/jobseeker' : '/auth/signup/employer';
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = errorData?.message || 'Signup failed. Please try again.';
        throw new Error(message);
      }

      toast.success("Account created. Now sign in to complete your registration.");
      setSigninData({
        email: signupData.email,
        password: signupData.password
      });
      setActiveTab("signin");
    } catch (err) {
      console.error(err);
      toast.error("Signup failed: " + err.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const loginRes = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signinData.email,
          password: signinData.password
        })
      });

      if (!loginRes.ok) throw new Error("Invalid credentials");

      const data = await loginRes.json();
      const token = data.token.replace(/\n/g, '');

      const warnings = [];

      // Upload resume if it's a job seeker and they selected a resume during signup
      if (resume && data.role === 'JOB_SEEKER') {
        const resumeForm = new FormData();
        resumeForm.append('file', resume);
        const resumeRes = await fetch(`${API_URL}/user/jobseeker/upload-resume`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: resumeForm
        });
        if (!resumeRes.ok) {
          const errData = await resumeRes.json().catch(() => null);
          const msg = errData?.message || "Resume upload failed.";
          warnings.push(msg + " You can upload it later from your profile.");
        }
      }

      const meRes = await fetch(`${API_URL}/user/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!meRes.ok) throw new Error("Failed to fetch updated user");

      const updatedUser = await meRes.json();
      login(updatedUser, token);

      toast.success("Signed in!");
      warnings.forEach((w) => toast.warning(w));
      onClose();
      
      if (data.role === 'EMPLOYER') {
        navigate("/dashboard");
      } else {
        navigate("/jobs");
      }
    } catch (err) {
      toast.error("Sign in failed: " + err.message);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50">
      <div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded md:shadow-lg relative overflow-y-auto">
        <div className="p-6">
          <button className="absolute top-3 right-4 text-2xl leading-none" onClick={onClose}>&times;</button>
          <div className="text-center text-2xl font-extrabold text-emerald-700 mb-4 flex items-center justify-center gap-2">
            <img src="/dinomate.png" alt="DinoMate Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" /> DinoMate
          </div>

          <div className="flex mb-4 border-b border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'signin' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'signup' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form className="space-y-4" onSubmit={handleSignIn}>
              <input name="email" onChange={handleSigninChange} value={signinData.email} type="email" placeholder="Email" className="w-full border px-3 py-3 rounded text-base" required />
              <input name="password" onChange={handleSigninChange} value={signinData.password} type="password" placeholder="Password" className="w-full border px-3 py-3 rounded text-base" required />
              <button type="submit" disabled={signingIn} className="w-full bg-black text-white py-2 rounded flex items-center justify-center gap-2 min-h-[44px]">
                {signingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="JOB_SEEKER" checked={role === 'JOB_SEEKER'} onChange={() => setRole('JOB_SEEKER')} className="accent-black" />
                  <span className="text-sm font-medium">Job Seeker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="EMPLOYER" checked={role === 'EMPLOYER'} onChange={() => setRole('EMPLOYER')} className="accent-black" />
                  <span className="text-sm font-medium">Recruiter</span>
                </label>
              </div>

              <input name="name" value={signupData.name} onChange={handleSignupChange} type="text" placeholder="Name" className="w-full border px-3 py-3 rounded text-base" required />
              <input name="email" value={signupData.email} onChange={handleSignupChange} type="email" placeholder="Email" className="w-full border px-3 py-3 rounded text-base" required />
              <input name="password" value={signupData.password} onChange={handleSignupChange} type="password" placeholder="Password" className="w-full border px-3 py-3 rounded text-base" required />

              {role === 'JOB_SEEKER' && (
                <div>
                  <label className="block mb-1 font-medium text-sm">Upload Resume (PDF):</label>
                  {!resume ? (
                    <input type="file" name="resume" accept=".pdf" onChange={handleResumeChange} className="w-full border px-3 py-3 rounded bg-gray-50 text-sm" />
                  ) : (
                    <p className="text-sm text-green-600">✅ {resume.name} uploaded</p>
                  )}
                </div>
              )}

              <button type="submit" className="w-full bg-black text-white py-3 rounded text-base font-medium min-h-[44px]">Sign Up</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
