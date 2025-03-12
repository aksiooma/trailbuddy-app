'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

const defaultValue: LanguageContextType = {
  language: 'fi',
  setLanguage: () => { },
  t: (key: string) => key,
  isLoading: true,
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fi');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load translations
    const loadTranslations = async () => {
      try {
        const translationModule = await import(`../components/translations/${language}.json`);
        if (translationModule.default && translationModule.default[language]) {
          setTranslations(translationModule.default[language]);
        } else {
          setTranslations(translationModule.default);
        }

        setIsLoading(false);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to Finnish if translation file not found
        if (language !== 'fi') {
          try {
            const fallbackModule = await import('../components/translations/fi.json');
            
            if (fallbackModule.default && fallbackModule.default) {
              setTranslations(fallbackModule.default);
            } else {
              setTranslations(fallbackModule.default);
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError);
          }
        }
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    // Split the key into parts (e.g. 'main.title' -> ['main', 'title'])
      if (isLoading) {
      return '';
    }
    const keys = key.split('.');

    // Recursively searches for the translation
    let translation: any = translations;
    for (const k of keys) {
      if (!translation || typeof translation !== 'object') {
        return key; // Return the key if translation is not found
      }
      translation = translation[k];
    }

    // If translation is not found, return the key
    if (!translation || typeof translation !== 'string') {
      return key;
    }

    // Replace parameters in the translation
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, paramValue),
        translation
      );
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}; 