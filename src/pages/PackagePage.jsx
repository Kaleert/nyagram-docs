import { useMemo } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, FileCode2, ChevronRight, Home, Box, Package } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import PackageNavigation from '../components/PackageNavigation';

const PackagePage = ({ db, currentPkg }) => {
  const { isDark, isAutoScrollEnabled } = useSettings(); // ← ДОБАВИТЬ

  const colors = {
    primary: '#E94033',
    secondary: '#F08D43',
    bg: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#f3f4f6' : '#111827',
    muted: isDark ? '#9ca3af' : '#6b7280',
    border: isDark ? '#333' : '#e5e7eb',
    cardBg: isDark ? '#1e1e1e' : '#ffffff',
    hoverBg: isDark ? '#2a2a2a' : '#f9fafb',
    divider: isDark ? '#2a2a2a' : '#f3f4f6'
  };

  const content = useMemo(() => {
    if (!db?.packages) return { folders: [], files: [] };

    const files = db.packages.find(p => p.name === currentPkg)?.items || [];
    
    const prefix = currentPkg ? `${currentPkg}.` : '';
    const subPackages = new Set();

    db.packages.forEach(p => {
      if (p.name.startsWith(prefix) && p.name !== currentPkg) {
        const relative = p.name.substring(prefix.length);
        const firstSegment = relative.split('.')[0];
        subPackages.add(prefix + firstSegment);
      }
    });

    const folders = Array.from(subPackages).map(fullPath => ({
      name: fullPath.split('.').pop(),
      fullPath: fullPath 
    })).sort((a, b) => a.name.localeCompare(b.name));

    return { folders, files };
  }, [db, currentPkg]);

  const breadcrumbs = useMemo(() => {
    if (!currentPkg) return [];
    const parts = currentPkg.split('.');
    return parts.map((part, index) => ({
      name: part,
      linkPath: parts.slice(0, index + 1).join('/') 
    }));
  }, [currentPkg]);
  
  useEffect(() => {
     if (isAutoScrollEnabled) {
         window.scrollTo(0, 0);
     }
  }, [currentPkg, isAutoScrollEnabled]);
  
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      paddingBottom: '80px',
      minHeight: '100vh'
    }}>
      {/* Breadcrumbs */}
      <div style={{
        width: '100%',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '32px',
        borderBottom: `1px solid ${colors.divider}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: '500',
          color: colors.muted,
          whiteSpace: 'nowrap'
        }}>
          <Link 
            to="/lib-api" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              color: colors.muted,
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
            onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
          >
            <Home size={16} /> API
          </Link>
          {breadcrumbs.map((crumb) => (
            <div key={crumb.linkPath} style={{ display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={14} style={{ margin: '0 8px', color: colors.border }} />
              <Link 
                to={`/lib-api/${crumb.linkPath}`} 
                style={{
                  textDecoration: 'none',
                  color: colors.muted,
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
                onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
              >
                {crumb.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          color: colors.text,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '12px',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            borderRadius: '12px',
            color: 'white',
            boxShadow: `0 10px 20px ${colors.primary}33`
          }}>
            {currentPkg ? <Package size={32} /> : <Box size={32} />}
          </div>
          <span style={{ wordBreak: 'break-all' }}>
            {currentPkg ? currentPkg : "API Reference"}
          </span>
        </h1>
        <p style={{
          color: colors.muted,
          fontSize: '18px',
          marginLeft: '4px',
          fontWeight: '500'
        }}>
          {content.folders.length} sub-packages, {content.files.length} types available
        </p>
      </div>

      {/* Folders Grid */}
      {content.folders.length > 0 && (
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: colors.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Folder size={14} /> Packages
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {content.folders.map((folder) => (
              <Link 
                key={folder.fullPath}
                to={`/lib-api/${folder.fullPath.replace(/\./g, '/')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 10px 25px ${colors.primary}1a`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                 <div style={{
                   width: '48px',
                   height: '48px',
                   borderRadius: '8px',
                   background: colors.hoverBg,
                   color: colors.muted,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   marginRight: '16px',
                   transition: 'all 0.3s'
                 }}>
                      <Folder size={24} />
                 </div>
                 <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 'bold',
                      color: colors.text,
                      fontSize: '18px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.2s'
                    }}>
                      {folder.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.muted,
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      marginTop: '4px',
                      opacity: 0.8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {folder.fullPath}
                    </div>
                 </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Files Grid */}
      {content.files.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: colors.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileCode2 size={14} /> Classes & Interfaces
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {content.files.map((file) => {
              // Цвета для типов с учетом темной темы
              const typeColors = {
                'Interface': { 
                  bg: isDark ? 'rgba(139, 92, 246, 0.15)' : '#faf5ff', 
                  text: '#8b5cf6', 
                  border: isDark ? 'rgba(139, 92, 246, 0.3)' : '#e9d5ff' 
                },
                'Enum': { 
                  bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb', 
                  text: '#f59e0b', 
                  border: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a' 
                },
                'Record': { 
                  bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', 
                  text: '#10b981', 
                  border: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0' 
                },
                'default': { 
                  bg: colors.hoverBg, 
                  text: colors.muted, 
                  border: colors.border 
                }
              };
              
              const colorSet = typeColors[file.type] || typeColors.default;

              return (
                <Link 
                  key={file.id}
                  to={`/lib-api/${currentPkg.replace(/\./g, '/')}/${file.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '20px',
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = isDark ? '#444' : '#d1d5db';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    marginTop: '4px',
                    marginRight: '20px',
                    color: colors.border,
                    transition: 'color 0.2s',
                    flexShrink: 0
                  }}>
                      <FileCode2 size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontWeight: 'bold',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        fontSize: '20px',
                        color: colors.text,
                        transition: 'color 0.2s',
                        wordBreak: 'break-word',
                        lineHeight: '1.2'
                      }}>
                        {file.name}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        border: `1px solid ${colorSet.border}`,
                        background: colorSet.bg,
                        color: colorSet.text,
                        whiteSpace: 'nowrap'
                      }}>
                        {file.type}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: colors.muted,
                      lineHeight: '1.6',
                      maxHeight: '40px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {file.description || "No description provided."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {content.folders.length === 0 && content.files.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '128px 0'
        }}>
          <div style={{ color: colors.border, marginBottom: '16px' }}>
            <Box size={64} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '8px'
          }}>
            Package is empty
          </h3>
          <p style={{
            color: colors.muted,
            marginTop: '8px'
          }}>
            There are no documented classes or sub-packages here.
          </p>
        </div>
      )}
      
      <PackageNavigation 
        db={db} 
        currentPkg={currentPkg} 
        currentClsId=""
        colors={colors} 
      />
    </div>
  );
};

export default PackagePage;