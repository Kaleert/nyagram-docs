import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export const typeCache = {};

export const TypeLink = ({ type }) => {
  const { isDark } = useSettings();
  
  if (!type) return null;

  const parts = type.split(/([<>,\[\]]|\s+)/).filter(Boolean);
  let bracketDepth = 0;

  return (
    <span style={{ 
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontWeight: '500',
    }}>
      {parts.map((part, i) => {
        const isOpening = part === '<';
        const isClosing = part === '>';
        
        if (isClosing) bracketDepth = Math.max(0, bracketDepth - 1);

        const isInsideGeneric = bracketDepth > 0 && !isOpening; 

        if (isOpening) bracketDepth++;

        const colors = {
            separator: isDark ? '#6b7280' : '#9ca3af', // Серый
            primitive: isDark ? '#fb923c' : '#ea580c', // Оранжевый
            generic:   isDark ? '#2dd4bf' : '#0d9488', // Бирюзовый (Teal)
            class:     isDark ? '#fbbf24' : '#d97706', // Золотистый (Amber)
        };

        if (/^[\s,<>[\]]+$/.test(part)) {
          return (
            <span key={i} style={{ color: colors.separator, fontWeight: 'normal' }}>
              {part}
            </span>
          );
        }

        const token = part.trim();
        const simpleName = token.includes('.') ? token.split('.').pop() : token;
        const link = typeCache[token] || typeCache[simpleName];

        let itemColor;
        if (/^(int|long|boolean|void|double|float|char|byte|short)$/.test(token)) {
            itemColor = colors.primitive;
        } else if ((/^[A-Z]$/.test(token) || token === '?') || isInsideGeneric) {
            itemColor = colors.generic;
        } else {
            itemColor = colors.class;
        }

        if (link) {
          return (
            <Link 
              key={i} 
              to={link} 
              style={{
                color: itemColor,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: itemColor,
                fontWeight: 'bold',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              {simpleName}
            </Link>
          );
        }

        return (
          <span key={i} style={{ color: itemColor }} title={!isInsideGeneric ? "External Class" : "Generic Parameter"}>
            {simpleName}
          </span>
        );
      })}
    </span>
  );
};

export default TypeLink;