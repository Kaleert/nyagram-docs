import React, { createContext, useContext, useState, useEffect } from 'react';
import { vscDarkPlus, dracula, atomDark, ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SettingsContext = createContext();

export const themes = {
  'VS Code Dark': vscDarkPlus,
  'Dracula': dracula,
  'Atom Dark': atomDark,
  'GitHub Light': ghcolors
};

export const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย (Thai)', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'be', name: 'Беларуская (Belarusian)', flag: '🇧🇾' },
  { code: 'kk', name: 'Қазақша (Kazakh)', flag: '🇰🇿' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', name: 'עברית (Hebrew)', flag: '🇮🇱' },
  { code: 'fa', name: 'فارسی (Persian)', flag: '🇮🇷' },
];

export const SettingsProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('nyagram-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [syntaxThemeName, setSyntaxThemeName] = useState(() => 
    localStorage.getItem('nyagram-syntax') || 'VS Code Dark'
  );

  const [isAutoScrollEnabled, setAutoScrollEnabled] = useState(() => {
    const saved = localStorage.getItem('nyagram-autoscroll');
    return saved !== 'false';
  });

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('nyagram-lang') || 'ru');

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('nyagram-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('nyagram-syntax', syntaxThemeName);
  }, [syntaxThemeName]);

  useEffect(() => {
    localStorage.setItem('nyagram-autoscroll', isAutoScrollEnabled);
  }, [isAutoScrollEnabled]);

  const toggleTheme = () => setIsDark(!isDark);
  
  const toggleAutoScroll = () => setAutoScrollEnabled(!isAutoScrollEnabled);

  const addNotification = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const changeLanguage = (langCode) => {
    localStorage.setItem('nyagram-lang', langCode);
    setCurrentLang(langCode);

    const domain = window.location.hostname === 'localhost' ? '' : `domain=.${window.location.hostname};`;
    document.cookie = `googtrans=/auto/${langCode}; path=/; ${domain}`;
    document.cookie = `googtrans=/auto/${langCode}; path=/;`; 

    const googleSelect = document.querySelector('.goog-te-combo');
    
    if (googleSelect) {
      googleSelect.value = langCode;
      googleSelect.dispatchEvent(new Event('change'));
    } else {
      setTimeout(() => {
        const retrySelect = document.querySelector('.goog-te-combo');
        if (retrySelect) {
          retrySelect.value = langCode;
          retrySelect.dispatchEvent(new Event('change'));
        }
      }, 500);
    }

    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('nyagram-lang');
    
    if (savedLang && savedLang !== 'ru') {
       const interval = setInterval(() => {
          const googleSelect = document.querySelector('.goog-te-combo');
          if (googleSelect) {
             if (googleSelect.value !== savedLang) {
                googleSelect.value = savedLang;
                googleSelect.dispatchEvent(new Event('change'));
             }
             clearInterval(interval);
          }
       }, 500);

       setTimeout(() => clearInterval(interval), 5000);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{
      isDark, toggleTheme,
      syntaxThemeName, setSyntaxThemeName, syntaxTheme: themes[syntaxThemeName],
      isAutoScrollEnabled, toggleAutoScroll,
      currentLang, changeLanguage, languages,
      notifications, addNotification, removeNotification,
      isSettingsOpen, setSettingsOpen
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);