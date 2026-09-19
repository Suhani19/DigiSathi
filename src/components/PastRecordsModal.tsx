import React from 'react';
import { FileText, Calendar, X, CheckCircle, ArrowRight } from 'lucide-react';
import { SampleDocument } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

interface PastRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (doc: SampleDocument) => void;
  currentId: string | null;
}

export const PastRecordsModal: React.FC<PastRecordsModalProps> = ({
  isOpen,
  onClose,
  onSelectRecord,
  currentId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="records-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="bg-[#FBF9F5] border-2 border-[#1E3A34] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D6CEC2] bg-[#EFEEEA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A34] text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="records-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-[#1E3A34]">
                Sample Notices &amp; Letters
              </h2>
              <p className="text-xs text-[#5E6562]">
                Explore pre-analyzed Medicare statements, hospital bills, and government letters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close records window"
            className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1B1C1A] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <p className="text-[14px] text-[#414846]">
            Select any real-world official document below to see how DigiSathi breaks down complex codes, deadlines, and disputes:
          </p>

          <div className="space-y-3">
            {SAMPLE_DOCUMENTS.map((doc) => {
              const isCurrent = doc.id === currentId;
              return (
                <div
                  key={doc.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-2 border-[#1E3A34] bg-white shadow-xs'
                      : 'border-[#D6CEC2] bg-[#F5F3EF] hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EFEEEA] text-[#1E3A34] border border-[#D6CEC2]">
                          {doc.formId || 'Official Form'}
                        </span>
                        <span className="text-xs text-[#727976] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {doc.date}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1B1C1A] mt-1">
                        {doc.title}
                      </h3>
                      <p className="text-[14px] text-[#414846] line-clamp-1 mt-0.5">
                        {doc.explanation.plainSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.billedAmount && (
                        <span className="text-[14px] font-bold text-[#1E3A34] bg-[#EFEEEA] px-2.5 py-1 rounded-lg">
                          {doc.billedAmount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectRecord(doc);
                          onClose();
                        }}
                        className={`min-h-[44px] px-4 py-2 rounded-lg text-[14px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#1E3A34] text-white'
                            : 'bg-white border border-[#1E3A34] text-[#1E3A34] hover:bg-[#1E3A34] hover:text-white'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Currently Viewing</span>
                          </>
                        ) : (
                          <>
                            <span>Open Letter</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EFEEEA] border-t border-[#D6CEC2] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 rounded-lg bg-[#1E3A34] hover:bg-[#2A4D45] text-white font-bold text-[14px] cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
