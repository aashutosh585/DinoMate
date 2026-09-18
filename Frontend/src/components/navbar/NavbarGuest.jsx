import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function NavbarGuest({ onOpenAuth }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="flex justify-between items-center">

        {/* LEFT - Logo + desktop nav links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-800">
          <span
            className="text-xl font-extrabold text-emerald-700 cursor-pointer flex items-center gap-2 tracking-tight"
            onClick={() => navigate("/")}
          >
            <img src="/dinomate.png" alt="DinoMate Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" /> DinoMate
          </span>
          <div className="hidden md:flex items-center gap-6">
            <span className="hover:text-black cursor-pointer" onClick={() => navigate('/jobs')}>Jobs</span>
            <span
              className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
              onClick={() => navigate('/aggregator')}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live 150+ Sync
            </span>
            <span className="hover:text-black cursor-pointer">Companies</span>
            <span className="hover:text-black cursor-pointer" onClick={onOpenAuth}>For Employers</span>
            <span className="hover:text-black cursor-pointer" onClick={onOpenAuth}>For Professionals</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-gray-700">

          {/* Desktop login / sign-up dropdowns */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onOpenAuth} className="px-4 py-1.5 border rounded hover:bg-gray-100 text-sm">
              Login
            </button>
            <button onClick={onOpenAuth} className="px-4 py-1.5 bg-black text-white rounded hover:opacity-90 text-sm">
              Sign Up
            </button>
          </div>

          {/* Mobile: plain buttons + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={onOpenAuth} className="px-3 py-1.5 border rounded text-sm">Login</button>
            <button onClick={onOpenAuth} className="px-3 py-1.5 bg-black text-white rounded text-sm">Sign Up</button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-xl p-1 ml-1"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 border-t pt-3 flex flex-col gap-4 text-sm font-medium text-gray-800">
          <span className="cursor-pointer hover:text-black" onClick={() => { navigate('/jobs'); closeMenu(); }}>Jobs</span>
          <span className="cursor-pointer text-emerald-700 font-semibold flex items-center gap-1.5" onClick={() => { navigate('/aggregator'); closeMenu(); }}>
            <img src="/dinomate.png" alt="" className="w-5 h-5 object-contain inline-block" /> Live 150+ Sync
          </span>
          <span className="cursor-pointer hover:text-black" onClick={closeMenu}>Companies</span>
          <span className="cursor-pointer hover:text-black" onClick={() => { onOpenAuth(); closeMenu(); }}>For Employers</span>
          <span className="cursor-pointer hover:text-black" onClick={() => { onOpenAuth(); closeMenu(); }}>For Professionals</span>
        </div>
      )}
    </nav>
  );
}
