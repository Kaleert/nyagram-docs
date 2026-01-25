import { useState } from 'react';
import { Menu, Github, Search, Sun, Moon, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchDialog from './SearchDialog';
import { useSettings } from '../context/SettingsContext';

const Navbar = ({ toggleSidebar, data }) => {
  const [showSearch, setShowSearch] = useState(false);
  
  const { isDark, toggleTheme, setSettingsOpen } = useSettings();

  const colors = {
    bg: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    border: isDark ? '#333' : '#e5e7eb',
    text: isDark ? '#f3f4f6' : '#1f2937',
    inputBg: isDark ? '#2A2A2A' : '#f9fafb',
    inputBorder: isDark ? '#444' : '#e5e7eb'
  };

  const iconButtonStyle = {
    display: 'flex',
    padding: '8px',
    color: isDark ? '#d1d5db' : '#6b7280',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        width: '100%',
        background: colors.bg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        height: '64px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          padding: '0 24px 0 16px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1920px',
          margin: '0 auto'
        }}>
          {/* ЛЕВАЯ ЧАСТЬ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleSidebar} 
              style={iconButtonStyle}
            >
              <Menu size={24} />
            </button>
            
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img 
                src={isDark ? '/logo-black.png' : '/logo.png'}
                alt="Nyagram" 
                className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
              />
            </Link>
          </div>

          {/* ЦЕНТР */}
          <div style={{ flex: 1, maxWidth: '500px', margin: '0 24px' }} className="hidden sm:block">
            <button 
              onClick={() => setShowSearch(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                color: isDark ? '#9ca3af' : '#6b7280',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <Search size={16} />
              <span style={{ fontSize: '14px' }}>Search...</span>
              <span style={{
                marginLeft: 'auto',
                background: isDark ? '#444' : 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                border: `1px solid ${colors.inputBorder}`,
                color: isDark ? '#ccc' : '#999'
              }}>
                Ctrl K
              </span>
            </button>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowSearch(true)} style={iconButtonStyle} className="sm:hidden">
               <Search size={20} />
            </button>

            <button onClick={toggleTheme} style={iconButtonStyle} title="Toggle Theme">
              {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
            </button>
            
            <button onClick={() => setSettingsOpen(true)} style={iconButtonStyle} title="Settings">
              <Settings size={20} />
            </button>
            
            <a 
              href="https://github.com/kaleert/nyagram" 
              target="_blank" 
              rel="noreferrer" 
              style={{ ...iconButtonStyle, marginRight: '-8px' }}
            >
              <Github size={22} />
            </a>
          </div>
        </div>
      </nav>

      {showSearch && data && <SearchDialog data={data} onClose={() => setShowSearch(false)} />}
    </>
  );
};

export default Navbar;