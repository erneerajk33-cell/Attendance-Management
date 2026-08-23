import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, ShieldCheck, X, CheckCircle2, UserCheck } from 'lucide-react';

interface ContactNeerajModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactNeerajModal: React.FC<ContactNeerajModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Attendance Assistance & Support');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setName('');
      setMessage('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-blue-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-400 text-white flex items-center justify-center font-black text-sm shadow-md">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">Er. Neeraj Kumar</h3>
              <p className="text-xs text-blue-100 font-medium">
                System Administrator & Technical In-charge • Online Attendance Portal
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {sentSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Message Dispatched!</h4>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Your support request has been logged and sent directly to Er. Neeraj Kumar. You will receive an immediate response.
              </p>
            </div>
          ) : (
            <>
              {/* Quick Contact Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="mailto:erneerajk33@gmail.com"
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition text-blue-900 shadow-xs"
                >
                  <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-blue-700">Direct Email</p>
                    <p className="text-xs font-bold truncate">erneerajk33@gmail.com</p>
                  </div>
                </a>

                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition text-emerald-900 shadow-xs"
                >
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Helpline / Support</p>
                    <p className="text-xs font-bold">+91 98765 43210</p>
                  </div>
                </a>
              </div>

              {/* Quick Help Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Name / Staff ID / Center Code
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Mishra (PAT-SKL-01)"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assistance Category
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  >
                    <option value="GPS Location / Radius Issue">GPS Location & Geo-fence Radius Issue</option>
                    <option value="Biometric / Face Verification Problem">Biometric / Face Verification Problem</option>
                    <option value="Device Lock / Unblock Request">Device Lock & Hardware ID Unblock</option>
                    <option value="Password Reset Assistance">Password Reset Assistance</option>
                    <option value="Leave & Attendance Discrepancy">Leave & Attendance Discrepancy</option>
                    <option value="General Center Operational Support">General Center Operational Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Message / Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please describe what assistance you need..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-600 resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    24/7 Technical SLA
                  </span>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
