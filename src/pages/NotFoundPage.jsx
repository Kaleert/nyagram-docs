import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Cat } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const NotFoundPage = () => {
  const { isDark } = useSettings();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Cat Image */}
      <div className="relative mb-8 group">
        <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${isDark ? 'bg-orange-500' : 'bg-orange-300'} group-hover:opacity-40 transition-opacity`} />
        <img 
          src="https://http.cat/404" 
          alt="404 Cat" 
          className="relative w-80 md:w-96 rounded-xl shadow-2xl border-4 transform transition-transform group-hover:scale-105 duration-300"
          style={{ borderColor: isDark ? '#333' : '#fff' }}
        />
      </div>

      <h1 className="text-6xl font-black mb-2" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
        404
      </h1>
      
      <p className="text-xl mb-8 max-w-md" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
        Упс! Похоже, этот котик съел страницу, которую вы ищете.
      </p>

      <Link 
        to="/" 
        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
        style={{ background: 'linear-gradient(90deg, #E94033, #F08D43)' }}
      >
        <Home size={20} />
        Вернуться домой
      </Link>
    </div>
  );
};

export default NotFoundPage;