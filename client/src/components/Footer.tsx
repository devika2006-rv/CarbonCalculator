import React from 'react';
import { Logo } from './Logo';
import { Mail, ExternalLink, Shield } from 'lucide-react';
import { InstagramIcon } from './Icons';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" light={true} showTagline={true} />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mt-3">
              A comprehensive sustainability technology initiative developed by the VAST Energy Cell in collaboration with Vidya NSS Units (101, 200, 663) and APJAKTU NSS Energy Cell.
            </p>
            <p className="text-xs text-emerald-400 font-medium">
              "Small Changes. Meaningful Impact."
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/_nss_vast_?srtk=Mzk2dWNqbm95dzgy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors border border-slate-700"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>Vidya NSS</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>

              <a
                href="https://www.instagram.com/energycell_apjaktunss?psln=YngzeHE1eHVubW5n"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors border border-slate-700"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>KTU Energy Cell</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('calculator'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Carbon Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('challenges'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Daily Green Challenges
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  My Impact Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('learn'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Learn & Explore
                </button>
              </li>
            </ul>
          </div>

          {/* Community & About */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Community
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { setActiveTab('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Participation Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Vidya & Energy Cell
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact & Suggestions
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Privacy & Data Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Institutional Contact
            </h3>
            <p className="text-xs text-slate-400 mb-2">
              Vidya Academy of Science & Technology<br />
              Thalakkottukara, Thrissur, Kerala
            </p>
            <a
              href="mailto:tl24btcs0304@vidyaacademy.ac.in"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors break-all"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>tl24btcs0304@vidyaacademy.ac.in</span>
            </a>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Coordinated By:</span>
              <span className="text-xs font-semibold text-slate-200">VAST Energy Cell (2026 - 27)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Discreet Admin Link */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="flex items-center gap-1 text-center sm:text-left">
            © {currentYear} CarbonCalculator. Developed for campus & community environmental awareness.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            {/* Discreet Admin Portal Link */}
            <button
              onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors group"
              title="Restricted Administrative Access"
            >
              <Shield className="w-3.5 h-3.5 group-hover:text-amber-400" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
