import React from 'react';
import { ShieldCheck, Lock, Eye, Trash2, Mail } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10 text-left">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparency & Data Integrity</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy & Data Protection Notice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last Updated: November 2026 • CarbonCalculator Platform (VAST Energy Cell)
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. Information We Collect
          </h2>
          <p>
            CarbonCalculator collects only the baseline information strictly necessary to provide personalized carbon calculation, challenge tracking, and institutional impact aggregation:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Account Identity:</strong> Full Name and Email Address.</li>
            <li><strong>Institutional Affiliation:</strong> User Category (Student, NSS Volunteer, Teacher, General Public), Institution Name, Institution Type, and District.</li>
            <li><strong>Footprint Inputs:</strong> Self-reported electricity usage, commute distances, food habits, waste segregation, and lifestyle metrics.</li>
            <li><strong>Gamification Records:</strong> Completed green challenges, timestamps, and accumulated Green Points.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            2. Public vs Administrative Visibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
              <span className="font-bold text-emerald-950 text-xs uppercase tracking-wide block">
                Public Community Leaderboard:
              </span>
              <p className="text-xs text-slate-600">
                Only <strong>anonymized, aggregated</strong> institutional metrics are displayed (e.g. "Vidya Academy - 45 participants - 3,200 points"). Individual names, email addresses, and personal calculations are <strong>strictly private</strong> and never visible publicly.
              </p>
            </div>

            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2">
              <span className="font-bold text-sky-950 text-xs uppercase tracking-wide block">
                Administrative System:
              </span>
              <p className="text-xs text-slate-600">
                Authorized VAST Energy Cell coordinators access aggregated usage counts and participant directories solely to evaluate institutional participation during school/college awareness campaigns. <strong>User passwords are encrypted with bcrypt and are completely inaccessible even to administrators.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            3. Account Deletion & Data Removal Process
          </h2>
          <p>
            We strictly honor the right to be forgotten. Any user wishing to purge their profile, calculation timeline, and challenge records can either:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Submit an account deletion request through our <a href="mailto:tl24btcs0304@vidyaacademy.ac.in" className="text-emerald-700 font-semibold underline">contact email</a> with the subject "Data Removal Request".</li>
            <li>Request removal via the campus NSS coordinator during any live awareness drive.</li>
          </ul>
          <p className="pt-1">
            Upon receipt, all database records referencing the user ID are permanently purged through database cascade deletion within 48 business hours.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            4. Contact & Inquiries
          </h2>
          <p>
            For privacy inquiries or technical clarification regarding emission factors, contact the VAST Energy Cell coordinators at:
          </p>
          <p className="font-bold text-emerald-800">
            tl24btcs0304@vidyaacademy.ac.in
          </p>
        </section>
      </div>
    </div>
  );
};
