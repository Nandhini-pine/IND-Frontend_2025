import React, { useState, useEffect, createContext } from 'react';

// Create the context
const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // default language
  const [translations, setTranslations] = useState({});

  // Load translations dynamically based on the selected language
  const loadTranslations = async (lang) => {
    const translationData = await import(`./${lang}.js`);
    setTranslations(translationData.default);
  };

  // Update translations whenever language changes
  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  // Function to toggle language
  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'en' ? 'ta' : 'en'));
  };

  // Helper function to get translation by key
  const t = (key) => translations[key] || key;

  return (
    <TranslationContext.Provider value={{ t, toggleLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;