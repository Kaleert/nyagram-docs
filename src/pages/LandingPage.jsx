import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Box, Code2, Globe, Terminal } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import Seo from '../components/Seo';

const LandingPage = () => {
  const { isDark } = useSettings();

  const colors = {
    text: isDark ? '#f3f4f6' : '#111827',
    muted: isDark ? '#9ca3af' : '#6b7280',
    cardBg: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333' : '#e5e7eb',
    primary: '#E94033',
  };

  const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl"
         style={{ 
           backgroundColor: colors.cardBg, 
           borderColor: colors.border,
         }}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
           style={{ background: 'rgba(233, 64, 51, 0.1)', color: colors.primary }}>
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>{title}</h3>
      <p style={{ color: colors.muted }}>{desc}</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <Seo 
          title="Nyagram — Best Java Telegram Bot Api Library & Spring Boot Framework"
          path="/"
        />
      
      {/* HERO SECTION */}
      <div className="relative pt-10 pb-20 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8 text-sm font-medium"
               style={{ 
                 borderColor: colors.primary, 
                 color: colors.primary,
                 backgroundColor: isDark ? 'rgba(233, 64, 51, 0.1)' : 'rgba(233, 64, 51, 0.05)' 
               }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Версия v1.1.2 уже доступна
          </div>
          
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight" style={{ color: colors.text }}>
            Создавай Telegram ботов <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E94033] to-[#F08D43]">
              Правильно
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-2xl mb-10" style={{ color: colors.muted }}>
            Nyagram — это современный, типобезопасный Java фреймворк для Telegram Bot API. 
            Работает на Spring Boot из коробки.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/docs/intro" 
                  className="px-8 py-4 rounded-xl font-bold text-white text-lg flex items-center gap-2 transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(90deg, #E94033, #F08D43)' }}>
              Начать работу <ArrowRight size={20} />
            </Link>
            <a href="https://github.com/kaleert/nyagram" 
               target="_blank" rel="noreferrer"
               className="px-8 py-4 rounded-xl font-bold text-lg border transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
               style={{ color: colors.text, borderColor: colors.border }}>
              GitHub
            </a>
          </div>
        </div>

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 blur-3xl rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, #E94033 0%, transparent 70%)' }} />
      </div>

      {/* FEATURES GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Zap} 
            title="Невероятно быстрый" 
            desc="Построен на Spring Boot 3 и Java 21. Использует виртуальные потоки (Loom) для максимальной производительности." 
          />
          <FeatureCard 
            icon={Shield} 
            title="Типобезопасность" 
            desc="Забудьте про сырой JSON. Работайте со строго типизированными объектами, рекордами и енамами." 
          />
          <FeatureCard 
            icon={Box} 
            title="Встроенная FSM" 
            desc="Машина состояний (Finite State Machine) для создания сложных диалогов уже внутри. Никаких велосипеды." 
          />
          <FeatureCard 
            icon={Code2} 
            title="Декларативный стиль" 
            desc="Используйте аннотации @CommandHandler и @Callback, чтобы код оставался чистым и читаемым." 
          />
          <FeatureCard 
            icon={Globe} 
            title="Готов к Webhooks" 
            desc="Переключайтесь между Long Polling и Webhook режимом одной строчкой в конфигурации." 
          />
          <FeatureCard 
            icon={Terminal} 
            title="Автоконфигурация" 
            desc="Ноль рутины. Просто добавьте зависимость, укажите токен и начинайте писать код." 
          />
        </div>
      </div>

      {/* CODE PREVIEW */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 dark:bg-[#1a1a1a]" style={{ borderColor: colors.border }}>
                <div className="w-3 h-3 rounded-full bg-red-500"/>
                <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                <div className="w-3 h-3 rounded-full bg-green-500"/>
                <span className="ml-2 text-xs font-mono opacity-50">MyBot.java</span>
            </div>
            <div className="p-6 overflow-x-auto text-sm sm:text-base font-mono leading-relaxed" 
                 style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff', color: isDark ? '#e6edf3' : '#24292e' }}>
                <pre>
<span style={{color: '#ff7b72'}}>@BotCommand</span>(<span style={{color: '#a5d6ff'}}>"/start"</span>)
<span style={{color: '#ff7b72'}}>public class</span> <span style={{color: '#d2a8ff'}}>StartCommand</span> &#123;

    <span style={{color: '#ff7b72'}}>@CommandHandler</span>
    <span style={{color: '#ff7b72'}}>public void</span> <span style={{color: '#d2a8ff'}}>handle</span>(CommandContext ctx) &#123;
        ctx.reply(<span style={{color: '#a5d6ff'}}>"Привет! Я работаю на Nyagram 🚀"</span>);
    &#125;
&#125;</pre>
            </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
