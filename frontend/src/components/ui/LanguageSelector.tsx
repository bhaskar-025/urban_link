import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LanguageSelectorProps {
  variant?: 'header' | 'footer';
}

export const LanguageSelector = ({ variant = 'header' }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
      >
        <Globe size={13} className="text-[#6032db]" />
        <span>{currentLanguage.label}</span>
        <ChevronDown size={11} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-28 bg-white border border-slate-100 rounded-xl shadow-lg z-[1000] p-1
          ${variant === 'header' ? 'mt-2' : 'bottom-full mb-2'}`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${i18n.language === lang.code ? 'bg-purple-50 text-[#6032db] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
