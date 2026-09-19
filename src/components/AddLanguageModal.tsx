import React, { useState, useMemo } from 'react';
import { Globe, X, Search, Plus, Check, Trash2, Sparkles, Languages } from 'lucide-react';
import {
  LanguageOption,
  DEFAULT_SUPPORTED_LANGUAGES,
  EXTENDED_CATALOG_LANGUAGES
} from '../data/languages';

interface AddLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguages: LanguageOption[];
  onAddLanguage: (lang: LanguageOption) => void;
  onRemoveLanguage: (code: string) => void;
  onSelectLanguage: (code: string) => void;
  currentLanguage: string;
}

export const AddLanguageModal: React.FC<AddLanguageModalProps> = ({
  isOpen,
  onClose,
  activeLanguages,
  onAddLanguage,
  onRemoveLanguage,
  onSelectLanguage,
  currentLanguage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customNativeName, setCustomNativeName] = useState('');
  const [customFlag, setCustomFlag] = useState('🌐');
  const [justAddedCode, setJustAddedCode] = useState<string | null>(null);

  // Combine default and extended catalog into full suggested pool
  const allCatalog = useMemo(() => {
    const combined = [...DEFAULT_SUPPORTED_LANGUAGES, ...EXTENDED_CATALOG_LANGUAGES];
    return combined;
  }, []);

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) {
      // Exclude already active languages from suggested grid
      return allCatalog.filter((c) => !activeLanguages.some((a) => a.code === c.code));
    }
    const q = searchQuery.toLowerCase().trim();
    return allCatalog.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nativeName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [allCatalog, activeLanguages, searchQuery]);

  if (!isOpen) return null;

  const handleAddFromCatalog = (lang: LanguageOption) => {
    onAddLanguage(lang);
    onSelectLanguage(lang.code);
    setJustAddedCode(lang.code);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const trimmedName = customName.trim();
    const code =
      trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) ||
      `custom-${Date.now()}`;

    // Resolve matching catalog language to inherit correct speechLang & flag
    const matched = allCatalog.find(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() ||
        c.code.toLowerCase() === code.toLowerCase() ||
        c.nativeName.toLowerCase() === trimmedName.toLowerCase()
    );

    const speechLang =
      matched?.speechLang ||
      (code.length === 2 ? `${code}-${code.toUpperCase()}` : `${code.slice(0, 2)}-${code.slice(0, 2).toUpperCase()}`);

    const newLang: LanguageOption = {
      code,
      name: trimmedName,
      nativeName: customNativeName.trim() || matched?.nativeName || trimmedName,
      speechLang: speechLang || 'en-US',
      flag: customFlag !== '🌐' ? customFlag : (matched?.flag || '🌐'),
      isCustom: true
    };

    onAddLanguage(newLang);
    onSelectLanguage(newLang.code);
    setCustomName('');
    setCustomNativeName('');
    setJustAddedCode(newLang.code);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lang-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="bg-[#FBF9F5] border-2 border-[#1E3A34] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D6CEC2] bg-[#EFEEEA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A34] text-white flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-lang-title" className="font-serif text-xl sm:text-2xl font-bold text-[#1E3A34]">
                Add Language Used by You
              </h2>
              <p className="text-xs text-[#5E6562]">
                Select or add your mother tongue to read summaries, deadlines, and letters with comfort
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close language selector"
            className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1B1C1A] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#727976] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language (e.g. Malayalam, Urdu, Odia, German, Arabic...)"
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#D6CEC2] focus:border-[#1E3A34] focus:ring-2 focus:ring-[#1E3A34]/20 rounded-xl text-[15px] text-[#1B1C1A] placeholder:text-[#8D9491] outline-hidden shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#727976] hover:text-[#1B1C1A] px-2 py-1 rounded bg-[#EFEEEA]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Suggested Languages Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#414846] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C05621]" />
                <span>Suggested World Languages ({filteredCatalog.length})</span>
              </h3>
              <span className="text-[12px] text-[#727976]">Tap any to add &amp; switch instantly</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-1">
              {filteredCatalog.map((lang) => {
                const isCurrentlyActive = activeLanguages.some((a) => a.code === lang.code);
                const isSelected = currentLanguage === lang.code;
                const isJustAdded = justAddedCode === lang.code;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleAddFromCatalog(lang)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 cursor-pointer transition-all hover:scale-[1.01] ${
                      isSelected || isJustAdded
                        ? 'bg-[#1E3A34] text-white border-[#1E3A34] shadow-xs'
                        : isCurrentlyActive
                        ? 'bg-[#EBF2EE] text-[#1E3A34] border-[#1E3A34]'
                        : 'bg-white border-[#D6CEC2] hover:border-[#1E3A34] text-[#1B1C1A]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-bold text-[14px] leading-tight">
                          {lang.nativeName}
                        </span>
                      </div>
                      <p
                        className={`text-[12px] mt-0.5 ${
                          isSelected || isJustAdded ? 'text-white/80' : 'text-[#727976]'
                        }`}
                      >
                        {lang.name}
                      </p>
                    </div>
                    {isSelected || isJustAdded ? (
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#727976] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Language Form */}
          <div className="p-4 rounded-xl bg-white border border-[#D6CEC2] shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A34] mb-2 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#1E3A34]" />
              <span>Can't find your language? Type it here:</span>
            </h3>
            <form onSubmit={handleAddCustom} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#5E6562] mb-1">
                    Language Name in English *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nepali, Bhojpuri, Sinhala, Dutch"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D6CEC2] focus:border-[#1E3A34] rounded-lg text-sm text-[#1B1C1A] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5E6562] mb-1">
                    Native Script (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. नेपाली"
                    value={customNativeName}
                    onChange={(e) => setCustomNativeName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D6CEC2] focus:border-[#1E3A34] rounded-lg text-sm text-[#1B1C1A] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#727976]">Flag / Icon:</span>
                  {['🌐', '🇮🇳', '🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪', '🇸🇦', '🇳🇵', '🇵🇭'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setCustomFlag(f)}
                      className={`w-7 h-7 rounded-md text-base flex items-center justify-center cursor-pointer ${
                        customFlag === f ? 'bg-[#1E3A34] text-white' : 'hover:bg-[#EFEEEA]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="min-h-[38px] px-4 py-1.5 rounded-lg bg-[#1E3A34] hover:bg-[#2A4D45] disabled:opacity-40 text-white font-bold text-[13px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Language</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Languages Management */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#414846] mb-2.5">
              Your Active Languages ({activeLanguages.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeLanguages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                const isDefault = DEFAULT_SUPPORTED_LANGUAGES.some((d) => d.code === lang.code);

                return (
                  <div
                    key={lang.code}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-[#1E3A34] text-white border-[#1E3A34]'
                        : 'bg-white text-[#1B1C1A] border-[#D6CEC2] hover:border-[#1E3A34]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        onClose();
                      }}
                      className="cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      {isSelected && <span className="text-[10px] opacity-80">(Active)</span>}
                    </button>

                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => onRemoveLanguage(lang.code)}
                        title={`Remove ${lang.name} from my languages`}
                        className="text-red-500 hover:text-red-700 ml-1 p-0.5 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#EFEEEA] border-t border-[#D6CEC2] flex items-center justify-between">
          <p className="text-xs text-[#5E6562]">
            DigiSathi translates the 30-second summary, jargon decoder, and next steps automatically.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 rounded-lg bg-[#1E3A34] hover:bg-[#2A4D45] text-white font-bold text-[14px] cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
