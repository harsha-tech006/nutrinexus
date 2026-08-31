import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import baseTranslations from '../translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { user, updateProfile } = useContext(AuthContext);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'english');

  // Sync language with user profile preference if available
  useEffect(() => {
    if (user && user.language_preference) {
      const userLang = user.language_preference.toLowerCase();
      if (baseTranslations[userLang]) {
        setLanguage(userLang);
        localStorage.setItem('language', userLang);
      }
    }
  }, [user]);

  const changeLanguage = async (newLang) => {
    const lang = newLang.toLowerCase();
    if (baseTranslations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      if (user) {
        // Persist to backend user profile preference
        const capLang = newLang.charAt(0).toUpperCase() + newLang.slice(1);
        try {
          await updateProfile({ language_preference: capLang });
        } catch (err) {
          console.error("Error updating user language preference:", err);
        }
      }
    }
  };

  const t = (key) => {
    if (!key) return '';
    return baseTranslations[language]?.[key] || baseTranslations.english?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations: baseTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;