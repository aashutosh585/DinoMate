import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FaBell, FaEnvelope, FaBookmark, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import defaultAvatar from '../../pics/deafult-avatar.png';
import NotificationBell from "../NotificationBell";

export default function Navbar({ onOpenJobSeeker, onOpenEmployer }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user && !user.profilePicture) {
      console.warn("⚠️ User has no profilePicture — using default avatar");
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const profileImageUrl = user?.profilePicture || defaultAvatar;

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="flex justify-between items-center">

        {/* LEFT - Logo + desktop nav links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-800">
          <span
            className="text-xl font-extrabold text-emerald-700 cursor-pointer flex items-center gap-2 tracking-tight"
            onClick={() => navigate('/')}
          >
            <img src="/dinomate.png" alt="DinoMate Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" /> DinoMate
          </span>
          {user ? (
            <div className="hidden md:flex items-center gap-6">
              <span className="cursor-pointer hover:text-emerald-700 transition" onClick={() => navigate('/')}>Home</span>
              <span className="cursor-pointer hover:text-emerald-700 transition" onClick={() => navigate('/jobs')}>Jobs</span>
              <span
                className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
                onClick={() => navigate('/aggregator')}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live 150+ Sync
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-6">
              <span className="cursor-pointer hover:text-emerald-700 transition" onClick={() => navigate('/jobs')}>Jobs</span>
              <span
                className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
                onClick={() => navigate('/aggregator')}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live 150+ Sync
              </span>
              <span className="cursor-pointer hover:text-emerald-700 transition">Companies</span>
              <span className="cursor-pointer hover:text-emerald-700 transition" onClick={onOpenEmployer}>For Employers</span>
              <span className="cursor-pointer hover:text-emerald-700 transition" onClick={onOpenJobSeeker}>For Professionals</span>
            </div>
          )}
        </div>

        {/* CENTER - Welcome message (desktop only) */}
        {user && (
          <div className="hidden md:flex text-sm font-medium text-gray-700">
            Welcome back, <span className="ml-1 font-semibold">{user.name}</span>
          </div>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-gray-700">
          {user ? (
            <>
              {/* Desktop-only icons */}
              <FaBookmark
                className="hidden md:block cursor-pointer text-lg hover:text-[#6F4E37] transition"
                title="My Jobs"
                onClick={() => navigate("/myjobs")}
              />
              <FaEnvelope
                className="hidden md:block cursor-pointer text-lg hover:text-[#6F4E37] transition"
                title="Messages"
              />

              {/* Always visible */}
              <NotificationBell />

              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full border object-cover cursor-pointer"
                title="Profile"
                onClick={() => navigate("/profile")}
                onError={(e) => {
                  console.warn("❌ Failed to load profile image, falling back to default.");
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
              />

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 border border-[#6F4E37] text-[#6F4E37] rounded hover:bg-[#6F4E37] hover:text-white transition text-sm"
              >
                Logout
              </button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden text-xl p-1 ml-1"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </>
          ) : (
            <>
              <button onClick={onOpenJobSeeker} className="px-4 py-1.5 border rounded hover:bg-gray-100 text-sm">Login</button>
              <button onClick={onOpenJobSeeker} className="px-4 py-1.5 bg-black text-white rounded hover:opacity-90 text-sm">Sign Up</button>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {user && menuOpen && (
        <div className="md:hidden mt-3 border-t pt-3 flex flex-col gap-4 text-sm font-medium text-gray-800">
          <span className="cursor-pointer hover:text-emerald-700" onClick={() => { navigate('/'); closeMenu(); }}>Home</span>
          <span className="cursor-pointer hover:text-emerald-700" onClick={() => { navigate('/jobs'); closeMenu(); }}>Jobs</span>
          <span className="cursor-pointer text-emerald-700 font-semibold flex items-center gap-1" onClick={() => { navigate('/aggregator'); closeMenu(); }}>
            <img src="/dinomate.png" alt="" className="w-5 h-5 object-contain inline-block" /> Live 150+ Sync
          </span>
          <span className="cursor-pointer hover:text-emerald-700" onClick={() => { navigate('/myjobs'); closeMenu(); }}>My Jobs</span>
        </div>
      )}
    </nav>
  );
}
