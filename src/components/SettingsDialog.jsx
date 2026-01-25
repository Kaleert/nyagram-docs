import React from 'react';
import { X, Check, ToggleLeft, ToggleRight, Globe, Settings } from 'lucide-react';
import { useSettings, themes } from '../context/SettingsContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const SettingsDialog = ({ onClose }) => {
  const { syntaxThemeName, setSyntaxThemeName, syntaxTheme,
    isAutoScrollEnabled, toggleAutoScroll,
    languages, currentLang, changeLanguage } = useSettings();

  const previewCode = `// Example Code
@BotCommand("/start")
public class StartCommand {
    public void execute(Context ctx) {
        ctx.reply("Hello!");
    }
}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] sm:max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings size={24} /> Settings
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* --- LANGUAGE SECTION --- */}
          <div className="mb-8">
            <h3 className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <Globe size={14} /> Language (Auto-Translate)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    currentLang === lang.code
                      ? 'border-nya-primary bg-nya-primary/5 dark:bg-nya-primary/10 ring-1 ring-nya-primary' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className={`font-medium text-sm ${
                    currentLang === lang.code 
                      ? 'text-nya-primary dark:text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
              * Page will reload to apply translation. Powered by Google Translate.
            </p>
          </div>

          {/* --- GENERAL SECTION (Auto-Scroll) --- */}
          <div className="mb-8">
             {/* ... Код автоскролла ... */}
             {/* (Вставьте сюда блок из предыдущих шагов) */}
             <h3 className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
              General
            </h3>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    Sidebar Auto-Scroll
                </span>
                <button 
                    onClick={toggleAutoScroll}
                    className={`transition-colors ${isAutoScrollEnabled ? 'text-nya-primary' : 'text-gray-400'}`}
                >
                    {isAutoScrollEnabled 
                        ? <ToggleRight size={32} /> 
                        : <ToggleLeft size={32} />}
                </button>
            </div>
          </div>

          {/* --- SYNTAX HIGHLIGHTING SECTION --- */}
          <div className="mb-6">
             {/* ... Код тем подсветки ... */}
             {/* (Вставьте код из старого SettingsDialog) */}
             <h3 className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
              Syntax Highlighting
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.keys(themes).map(name => {
                const isActive = syntaxThemeName === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSyntaxThemeName(name)}
                    className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                      isActive
                        ? 'border-nya-primary bg-nya-primary/5 dark:bg-nya-primary/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${isActive ? 'text-nya-primary dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {name}
                      </span>
                      {isActive && <Check size={16} className="text-nya-primary" />}
                    </div>
                    
                    <div className="text-[10px] opacity-80 pointer-events-none rounded overflow-hidden border border-gray-100 dark:border-gray-700">
                       <SyntaxHighlighter 
                          language="java" 
                          style={themes[name]} 
                          customStyle={{ margin: 0, padding: '8px' }}
                          codeTagProps={{ style: { fontSize: '10px' } }}
                       >
                          {'class Demo {}'}
                       </SyntaxHighlighter>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE PREVIEW (Optional) */}
          <div>
            {/* ... */}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 flex justify-end shrink-0 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;