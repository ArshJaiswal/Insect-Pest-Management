import React, { useState, useRef, useEffect } from 'react';
import { languages } from '../lib/languages.js';

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors duration-200"
        title="Change language"
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                language.code === currentLanguage 
                  ? 'bg-green-50 text-green-700 font-medium' 
                  : 'text-gray-700'
              }`}
            >
              <span className="text-base">{language.flag}</span>
              <span>{language.name}</span>
              {language.code === currentLanguage && (
                <span className="ml-auto text-green-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;