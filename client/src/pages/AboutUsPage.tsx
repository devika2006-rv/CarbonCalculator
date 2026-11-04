import React, { useState } from 'react';
import {
  GraduationCap,
  Heart,
  Zap,
  Users,
  Mail,
  ExternalLink,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { InstagramIcon } from '../components/Icons';
import { api } from '../services/api';

export const AboutUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.contact.submit(formData);
      setSubmitStatus(`Thank you! Your message has been received (Ref #${res.id}).`);
      setFormData({ name: '', email: '', category: 'General', message: '' });
      setTimeout(() => setSubmitStatus(null), 6000);
    } catch (err: any) {
      setSubmitStatus(`Error: ${err.message || 'Failed to submit'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16 text-left">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Institutional Legacy & Sustainable Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About Us
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          The collaborative vision driving the CarbonCalculator sustainability platform.
        </p>
      </div>

      {/* A. About Vidya Academy of Science and Technology */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Host Institution</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              About Vidya Academy of Science and Technology
            </h2>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
          Vidya Academy of Science and Technology (VAST), located in Thalakkottukara, Thrissur, is a premier engineering institution established in 2003. Affiliated with APJ Abdul Kalam Technological University (KTU) and approved by AICTE, the college offers diverse undergraduate and postgraduate programs. Known for academic excellence, robust placement support, and vibrant campus life, VAST fosters holistic technical and professional development.
        </p>
      </section>

      {/* B. About Vidya NSS */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Community Outreach</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              About Vidya NSS
            </h2>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
          Vidya's National Service Scheme (NSS) units (101, 200 and 663) are among the most vibrant student wings on campus, dedicated to moulding socially conscious engineers through community service. Operating under the motto 'Not Me, But You,' the volunteers actively engage in diverse initiatives such as the flagship public asset restoration program Punarjjani, regular blood donation drives, energy and environmental conservation campaigns, disaster relief training, and community welfare projects. Through village adoption camps, awareness drives, and grassroots outreach, the NSS cell consistently fosters leadership, empathy, and a strong sense of civic responsibility among students.
        </p>
      </section>

      {/* C. About APJAKTU NSS Energy Cell */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">University State Initiative</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              About APJAKTU NSS Energy Cell
            </h2>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
          The KTU NSS Energy Cell is a dedicated initiative under the APJ Abdul Kalam Technological University NSS Cell that drives sustainability and resource efficiency across affiliated engineering campuses. By spearheading practical energy audits, renewable energy workshops, and community-wide awareness campaigns, the cell empowers student volunteers to champion green technologies, promote energy conservation, and tackle pressing environmental challenges at the grassroots level.
        </p>
      </section>


      {/* E. Contact and Enquiries */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Get In Touch</span>
          <h2 className="text-2xl font-bold text-slate-900">Contact & Enquiries</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            We welcome suggestions, feedback, campus awareness drive invitations, and sustainability collaboration requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Details & Social Links (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide block">
                Official Enquiry Email
              </span>
              <a
                href="mailto:tl24btcs0304@vidyaacademy.ac.in"
                className="flex items-center gap-2 text-sm sm:text-base font-bold text-emerald-800 hover:text-emerald-950 break-all transition-colors"
              >
                <Mail className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>tl24btcs0304@vidyaacademy.ac.in</span>
              </a>
              <p className="text-[11px] text-slate-500">
                Click to draft an email directly to the student coordinators.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide block">
                Follow On Instagram
              </span>
              <div className="space-y-2">
                <a
                  href="https://www.instagram.com/_nss_vast_?srtk=Mzk2dWNqbm95dzgy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <InstagramIcon className="w-4 h-4 text-pink-600" />
                    <span>Vidya NSS Official</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="https://www.instagram.com/energycell_apjaktunss?psln=YngzeHE1eHVubW5n"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <InstagramIcon className="w-4 h-4 text-pink-600" />
                    <span>APJAKTU NSS Energy Cell</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Feedback / Enquiry Form (7 cols) */}
          <div className="md:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enquiry Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="General">General Enquiry</option>
                  <option value="Feedback">Platform Feedback</option>
                  <option value="Suggestion">Calculator / Challenge Suggestion</option>
                  <option value="Collaboration">Campus Awareness Collaboration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  placeholder="Share your feedback, ideas, or event details..."
                ></textarea>
              </div>

              {submitStatus && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  submitStatus.startsWith('Thank you') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {submitStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
