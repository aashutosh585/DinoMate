import appleIcon from '../pics/icons8-apple-50.png';
import androidIcon from '../pics/andr.png';
import facebookIcon from '../pics/icons8-facebook-50.png';
import twitterIcon from '../pics/icons8-twitter-50.png';
import youtubeIcon from '../pics/icons8-youtube-50.png';
import instagramIcon from '../pics/instagram-icon.png';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 text-sm mt-12 border-t">
      {/* Top Columns */}
      <div className="max-w-7xl mx-auto py-10 px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div>
          <h3 className="text-lg font-extrabold text-emerald-700 mb-2 flex items-center gap-2">
            <img src="/dinomate.png" alt="Dino_Mate Logo" className="w-7 h-7 object-contain rounded-md" /> Dino_Mate
          </h3>
          <p className="text-xs text-gray-500">Real-Time Job Aggregation from 150+ Platforms</p>
        </div>

        <div>
          <h4 className="font-bold mb-2">Dino_Mate</h4>
          <ul className="space-y-1">
            <li>About / Press</li>
            <li>Blog</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-2">Employers</h4>
          <ul className="space-y-1">
            <li>Get a Free Employer Account</li>
            <li>Employer Center</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-2">Information</h4>
          <ul className="space-y-1">
            <li>Help</li>
            <li>Guidelines</li>
            <li>Terms of Use</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-2">Work With Us</h4>
          <ul className="space-y-1">
            <li>Advertisers</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>

      {/* Middle Row - App and Social */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center py-6 gap-4">
        <div className="flex items-center gap-3">
          <p>Download the App</p>
          <img src={androidIcon} alt="Android" className="w-6 h-6" />
          <img src={appleIcon} alt="Apple" className="w-6 h-6" />
        </div>

        <div className="flex gap-4">
          <img src={facebookIcon} alt="Facebook" className="w-6 h-6" />
          <img src={twitterIcon} alt="Twitter" className="w-6 h-6" />
          <img src={youtubeIcon} alt="YouTube" className="w-6 h-6" />
          <img src={instagramIcon} alt="Instagram" className="w-6 h-6" />
        </div>

        <select className="border px-4 py-2 rounded text-sm">
          <option>United States</option>
          <option>Egypt</option>
          <option>Germany</option>
        </select>
      </div>

      {/* Bottom Strip */}
      <div className="border-t text-center py-4 text-xs text-gray-600">
        <p>
          Browse by: <span className="font-semibold text-black">Companies, Jobs, Locations, Communities, Recent Posts</span>
        </p>
        <p className="mt-2">
          © 2026 Dino_Mate. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
