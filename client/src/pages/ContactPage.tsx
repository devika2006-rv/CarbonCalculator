import React, { useState } from 'react';
import {
  Mail,
  Send,
  ExternalLink,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { InstagramIcon } from '../components/Icons';
import { api } from '../services/api';

export const ContactPage: React.FC = () => {
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
      setSubmitStatus(`Thank you! Your enquiry has been received (Ref #${res.id}). Our coordinators will get back to you.`);
      setFormData({ name: '', email: '', category: 'General', message: '' });
      setTimeout(() => setSubmitStatus(null), 6000);
    } catch (err: any) {
      setSubmitStatus(`Error: ${err.message || 'Failed to submit'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12 text-left">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Mail className="w-3.5 h-3.5 text-emerald-600" />
          <span>Connect With Us</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contact & Enquiries
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Reach out to the VAST Energy Cell and NSS student coordinators for feedback, workshop collaborations, or questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Institutional Coordinators</h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Location</strong>
                  <p className="text-slate-600">Vidya Academy of Science & Technology<br />Thalakkottukara, Thrissur, Kerala</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Direct Email</strong>
                  <a
                    href="mailto:tl24btcs0304@vidyaacademy.ac.in"
                    className="text-emerald-700 hover:text-emerald-900 font-semibold break-all"
                  >
                    tl24btcs0304@vidyaacademy.ac.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Response Time</strong>
                  <p className="text-slate-600">Student coordinators monitor submissions daily during campus sessions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Channels */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Official Social Handles</h4>
            <div className="space-y-2">
              <a
                href="https://www.instagram.com/_nss_vast_?srtk=Mzk2dWNqbm95dzgy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-pink-600" />
                  <span>Vidya NSS Official</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="https://www.instagram.com/energycell_apjaktunss?psln=YngzeHE1eHVubW5n"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-pink-600" />
                  <span>APJAKTU NSS Energy Cell</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Form Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Send a Direct Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Your full name"
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
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="General">General Enquiry</option>
                <option value="Feedback">Platform Feedback</option>
                <option value="Suggestion">Calculator / Factor Suggestion</option>
                <option value="Collaboration">Campus Awareness Programme Collaboration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Message Content *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                placeholder="Type your message here..."
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
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
