import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Info, Cookie } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const NotificationItem = ({ id, message, type, duration, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  const colors = {
    success: { bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200', icon: 'text-green-500', bar: 'bg-green-500' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200', icon: 'text-blue-500', bar: 'bg-blue-500' },
    cookie: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-800 dark:text-gray-200', icon: 'text-orange-500', bar: 'bg-orange-500' }
  }[type] || colors.info;

  const Icon = type === 'cookie' ? Cookie : type === 'success' ? CheckCircle : Info;

  return (
    <div className={`relative w-80 mb-3 rounded-lg border shadow-lg overflow-hidden animate-in slide-in-from-right duration-300 ${colors.bg} ${colors.border}`}>
      <div className="p-4 flex items-start gap-3">
        <Icon size={20} className={`mt-0.5 shrink-0 ${colors.icon}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text}`}>{message}</p>
        </div>
        <button onClick={() => onDismiss(id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X size={16} />
        </button>
      </div>
      {/* Timer Line */}
      <div className="absolute bottom-0 left-0 h-1 transition-all ease-linear" 
           style={{ width: `${progress}%`, backgroundColor: 'currentColor' }} 
           className={colors.bar} />
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification, addNotification } = useSettings();
  const [cookieAccepted, setCookieAccepted] = useState(() => localStorage.getItem('nyagram-cookies'));

  useEffect(() => {
    if (!cookieAccepted) {
        setTimeout(() => {
            addNotification("We use cookies/localStorage to save your theme preferences.", 'cookie', 10000);
            localStorage.setItem('nyagram-cookies', 'true');
            setCookieAccepted(true);
        }, 1500);
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map(n => (
          <NotificationItem key={n.id} {...n} onDismiss={removeNotification} />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;