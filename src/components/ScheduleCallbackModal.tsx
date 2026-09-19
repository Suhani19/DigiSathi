import React, { useState } from 'react';
import { Calendar, Clock, X, Check, Phone } from 'lucide-react';

interface ScheduleCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
}

export const ScheduleCallbackModal: React.FC<ScheduleCallbackModalProps> = ({
  isOpen,
  onClose,
  documentTitle
}) => {
  const [preferredTime, setPreferredTime] = useState('morning');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [caregiverNote, setCaregiverNote] = useState('I would like help calling Dr. Chen’s billing coordinator.');
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="bg-[#FBF9F5] border-2 border-[#1E3A34] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D6CEC2] bg-[#EFEEEA]">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#1E3A34]" />
            <h2 id="schedule-modal-title" className="font-serif text-xl font-bold text-[#1E3A34]">
              Schedule a Quiet Time with an Advocate
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scheduling window"
            className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1B1C1A] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isBooked ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1E3A34] text-white flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1E3A34]">
                Quiet Time Scheduled
              </h3>
              <p className="text-[17px] text-[#414846] leading-relaxed max-w-sm mx-auto">
                A DigiSathi Eldercare Advocate will call you at{' '}
                <strong className="text-[#1B1C1A]">{phoneNumber || '(555) 019-4820'}</strong> during your
                chosen window. We will review your letter together at a calm pace.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsBooked(false);
                  onClose();
                }}
                className="min-h-[50px] px-8 py-2.5 rounded-lg bg-[#1E3A34] text-white font-bold text-[16px] cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="p-3.5 rounded-xl bg-[#F5F3EF] border border-[#D6CEC2] text-sm text-[#414846]">
                <strong className="text-[#1E3A34]">Regarding:</strong> {documentTitle}
              </div>

              <div>
                <label className="block text-[16px] font-bold text-[#1B1C1A] mb-1.5">
                  Best Quiet Window:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPreferredTime('morning')}
                    className={`min-h-[52px] p-3 rounded-xl border text-left flex flex-col justify-center cursor-pointer transition-colors ${
                      preferredTime === 'morning'
                        ? 'border-2 border-[#1E3A34] bg-white font-bold text-[#1E3A34]'
                        : 'border-[#D6CEC2] bg-[#F5F3EF] text-[#414846]'
                    }`}
                  >
                    <span className="text-[15px] font-bold">Tomorrow Morning</span>
                    <span className="text-xs font-normal">9:30 AM – 11:30 AM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredTime('afternoon')}
                    className={`min-h-[52px] p-3 rounded-xl border text-left flex flex-col justify-center cursor-pointer transition-colors ${
                      preferredTime === 'afternoon'
                        ? 'border-2 border-[#1E3A34] bg-white font-bold text-[#1E3A34]'
                        : 'border-[#D6CEC2] bg-[#F5F3EF] text-[#414846]'
                    }`}
                  >
                    <span className="text-[15px] font-bold">Tomorrow Afternoon</span>
                    <span className="text-xs font-normal">1:30 PM – 3:30 PM</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="schedule-phone" className="block text-[16px] font-bold text-[#1B1C1A] mb-1.5">
                  Phone number to reach you or your family:
                </label>
                <input
                  id="schedule-phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. (555) 234-5678"
                  className="w-full min-h-[50px] px-4 rounded-xl border-1.5 border-[#D6CEC2] bg-white text-[#1B1C1A] text-[17px] focus:border-[#1E3A34]"
                />
              </div>

              <div>
                <label htmlFor="schedule-notes" className="block text-[16px] font-bold text-[#1B1C1A] mb-1.5">
                  What would you like the advocate to know in advance?
                </label>
                <textarea
                  id="schedule-notes"
                  rows={2}
                  value={caregiverNote}
                  onChange={(e) => setCaregiverNote(e.target.value)}
                  className="w-full p-3 rounded-xl border-1.5 border-[#D6CEC2] bg-white text-[#1B1C1A] text-[16px] focus:border-[#1E3A34]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] px-5 rounded-lg border border-[#D6CEC2] text-[#414846] font-semibold text-[15px] hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[52px] px-7 rounded-lg bg-[#1E3A34] text-white font-bold text-[16px] hover:bg-[#142723] cursor-pointer shadow-xs"
                >
                  Confirm Quiet Time
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
