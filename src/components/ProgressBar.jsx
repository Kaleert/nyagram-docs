import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const ProgressBar = () => {
  const location = useLocation();
  const { isDark } = useSettings();
  
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setProgress(0);
    setOpacity(1);

    const startTimeout = setTimeout(() => {
      setProgress(70);
    }, 50);

    const finishTimeout = setTimeout(() => {
      setProgress(100);
    }, 400);

    const fadeTimeout = setTimeout(() => {
      setOpacity(0);
    }, 700);

    const resetTimeout = setTimeout(() => {
      setProgress(0);
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(finishTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(resetTimeout);
    };
  }, [location.pathname]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #F08D43, #fb923c)',
        boxShadow: '0 0 10px rgba(240, 141, 67, 0.7)',
        zIndex: 9999,
        width: `${progress}%`,
        opacity: opacity,
        transition: 'width 0.3s ease-in-out, opacity 0.3s ease-out',
        pointerEvents: 'none'
      }}
    />
  );
};

export default ProgressBar;