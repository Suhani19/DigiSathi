import React, { useState } from 'react';
import { ShieldCheck, PhoneCall, Heart, Info, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [showA11yModal, setShowA11yModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <footer className="mt-16 border-t border-[#D6CEC2] bg-[#F5F3EF] pt-10 pb-12 transition-colors">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        {/* Top Info Banner matching Image 4 */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border-1.5 border-[#D6CEC2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-left">
          {/* Security & HIPAA Trust */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#EFEEEA] border border-[#1E3A34] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#1E3A34]" />
            </div>
            <div>
              <h4 className="font-serif text-[17px] font-bold text-[#1E3A34]">
                DigiSathi: HIPAA Compliant &amp; Bank-Grade Security
              </h4>
              <p className="text-[14px] text-[#414846]">
                Your private records are never sold, shared, or used for AI model training.
              </p>
            </div>
          </div>

          {/* Quick Helplines Summary */}
          <div className="text-left md:text-right text-xs text-[#414846] border-t md:border-t-0 md:border-l border-[#D6CEC2] pt-4 md:pt-0 md:pl-6">
            <p className="font-bold text-[#1E3A34] text-sm mb-0.5">
              National Senior Helplines &amp; Sathi Care
            </p>
            <p>
              <strong>Elderline:</strong> 14567 &bull; <strong>Emergency:</strong> 112
            </p>
            <p className="mt-0.5">
              Elderline (8 AM &ndash; 8 PM) &bull; Emergency 112 (24/7) &bull; Sathi: 1-800-555-CARE
            </p>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#414846]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#1E3A34] text-base">T</span>
            <p>
              Need easier reading? Press the <strong className="text-[#1E3A34]">A+</strong> button at the top
              right of any page to enlarge the text.
            </p>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button
              type="button"
              onClick={() => setShowA11yModal(true)}
              className="hover:text-[#1E3A34] underline cursor-pointer"
            >
              DigiSathi Accessibility Statement
            </button>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-[#1E3A34] underline cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Statement Modal */}
      {showA11yModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-[#FBF9F5] border-2 border-[#1E3A34] rounded-2xl w-full max-w-lg p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CEC2] mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1E3A34]">
                DigiSathi Accessibility Commitment
              </h3>
              <button
                type="button"
                onClick={() => setShowA11yModal(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[16px] text-[#414846] leading-relaxed mb-3">
              DigiSathi is built from the ground up for older adults and family caregivers. We adhere strictly
              to WCAG AAA contrast guidelines and ensure:
            </p>
            <ul className="list-disc pl-5 text-[15px] text-[#414846] space-y-1.5 mb-4">
              <li>High-contrast typography using Merriweather and Public Sans fonts.</li>
              <li>Text scaling up to 150% without horizontal scrolling or clipping.</li>
              <li>Visible 3px keyboard focus outlines on every interactive element.</li>
              <li>Full Web Speech API voice readout for natural auditory narration.</li>
              <li>All primary buttons exceed 48x48px touch targets for ease of motor tapping.</li>
            </ul>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowA11yModal(false)}
                className="min-h-[44px] px-5 rounded-lg bg-[#1E3A34] text-white font-bold cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-[#FBF9F5] border-2 border-[#1E3A34] rounded-2xl w-full max-w-lg p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CEC2] mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1E3A34]">
                DigiSathi Privacy &amp; Dignity Guarantee
              </h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[16px] text-[#414846] leading-relaxed mb-3">
              Senior legal, medical, and banking paperwork contains sensitive personal identifiers.
              DigiSathi respects your privacy:
            </p>
            <ul className="list-disc pl-5 text-[15px] text-[#414846] space-y-1.5 mb-4">
              <li>Documents are processed securely and transiently via encrypted server-side channels.</li>
              <li>Your uploaded photos or medical details are never retained to train public AI models.</li>
              <li>Caregiver sync sharing is restricted strictly to your authorized loved ones.</li>
            </ul>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="min-h-[44px] px-5 rounded-lg bg-[#1E3A34] text-white font-bold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
