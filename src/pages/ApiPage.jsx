 import { useEffect, useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Github, Hash, Code2, Link as LinkIcon, Folder, FileCode2, 
  AlertTriangle, Clock, ArrowRight, Book, Hammer, ChevronRight, Home,
  List, ChevronLeft, BoxSelect, ListOrdered, AlertCircle
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useSettings } from '../context/SettingsContext';
import { TypeLink } from '../components/TypeLink';
import PackageNavigation from '../components/PackageNavigation';

const Breadcrumbs = ({ pkg, cls, colors }) => {
  const parts = pkg ? pkg.split('.') : [];
  
  const linkStyle = {
    textDecoration: 'none',
    color: colors.muted,
    transition: 'color 0.2s',
    cursor: 'pointer',
    display: 'flex', 
    alignItems: 'center'
  };

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      paddingBottom: '8px',
      marginBottom: '24px',
      scrollbarWidth: 'none'
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
          to="/" 
          style={linkStyle}
          onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
          onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
        >
          <Home size={16} />
        </Link>
        <ChevronRight size={14} style={{ margin: '0 8px', color: colors.border }} />
        <Link 
          to="/api" 
          style={linkStyle}
          onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
          onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
        >
          API
        </Link>
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={14} style={{ margin: '0 8px', color: colors.border }} />
              <Link 
                to={`/api/${path}`} 
                style={linkStyle}
                onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
                onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
              >
                {part}
              </Link>
            </div>
          );
        })}
        <ChevronRight size={14} style={{ margin: '0 8px', color: colors.border }} />
        <span style={{
          color: colors.text,
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '4px',
          background: colors.badgeBg
        }}>
          {cls}
        </span>
      </div>
    </div>
  );
};

const MobileTOC = ({ sections, colors, scrollToAnchor }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (sections.length === 0) return null;

  return (
    <div className="lg:hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          color: colors.text,
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={16} /> On this page
        </span>
        <ChevronRight 
          size={16} 
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
        />
      </button>

      {isOpen && (
        <div style={{
          marginTop: '8px',
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {sections.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                scrollToAnchor(id);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: colors.muted,
                fontSize: '14px',
                borderRadius: '6px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = colors.hoverBg;
                e.currentTarget.style.color = colors.text;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.muted;
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ApiPage = ({ db, pkg, cls }) => { 
  const location = useLocation();
  const [classData, setClassData] = useState(null);
  const { addNotification, syntaxTheme, isDark, isAutoScrollEnabled } = useSettings();

  const colors = {
    primary: '#E94033',
    secondary: isDark ? '#F08D43' : '#F08D43',
    bg: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#f3f4f6' : '#111827',
    muted: isDark ? '#9ca3af' : '#6b7280',
    border: isDark ? '#374151' : '#e5e7eb',
    cardBg: isDark ? '#1E1E1E' : '#ffffff',
    codeBg: isDark ? '#111111' : '#f9fafb',
    badgeBg: isDark ? '#2A2A2A' : '#f3f4f6',
    hoverBg: isDark ? '#2A2A2A' : '#f9fafb',
    tableHeaderBg: isDark ? '#27272a' : '#f9fafb',
    tableStripe: isDark ? '#252526' : '#fafafa'
  };

  const SectionHeader = ({ title, icon: Icon, id, onLinkClick }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      paddingBottom: '8px',
      borderBottom: `2px solid ${isDark ? '#27272a' : '#f3f4f6'}`
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: colors.text
      }}>
        <div style={{
          padding: '6px',
          background: colors.primary,
          color: 'white',
          borderRadius: '8px',
          display: 'flex',
          boxShadow: `0 4px 6px ${colors.primary}4d`
        }}>
          <Icon size={20} />
        </div>
        {title}
      </h2>
      <button 
        onClick={onLinkClick}
        style={{
          padding: '8px',
          color: colors.muted,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
        onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
      >
        <Hash size={20} />
      </button>
    </div>
  );

  useEffect(() => {
    if (!db || !db.packages || !pkg || !cls) return;
    const pkgData = db.packages.find(p => p.name === pkg);
    if (!pkgData) return;
    const clsData = pkgData.items.find(i => i.id === cls);
    setClassData(clsData);
  }, [db, pkg, cls]);

  useEffect(() => {
    if (!classData) return;
    document.title = `${classData.name} | Nyagram API`;
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      if (isAutoScrollEnabled) {
          window.scrollTo(0, 0);
      } else {
          setTimeout(() => {
             window.scrollTo({ 
                 top: document.body.scrollHeight, 
                 behavior: 'instant'
             });
          }, 50);
      }
    }
  }, [classData, location.hash]);

  if (!classData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: colors.text }}>
        Загрузка...
      </div>
    );
  }
  
  const githubBase = db.metadata?.githubUrl || "https://github.com/kaleert/nyagram";
  const sourcePath = db.metadata?.sourcePath || "src/main/java";
  const pkgPath = `com/kaleert/nyagram/${pkg.replace(/\./g, '/')}`;
  const fileUrl = `${githubBase}/blob/master/${sourcePath}/${pkgPath}/${classData.name}.java`;

  const scrollToAnchor = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      window.history.pushState(null, null, `#${id}`);
    }
  };

  const handleCopyLink = (anchor) => {
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
    navigator.clipboard.writeText(url)
      .then(() => addNotification("Ссылка скопирована", "success"))
      .catch(err => console.error("Could not copy text: ", err));
  };

  const tocSections = [
    classData.enumConstants?.length > 0 && { id: 'enums', label: 'Enum Constants', Icon: ListOrdered },
    classData.fields?.length > 0 && { id: 'fields', label: 'Fields', Icon: Hash },
    classData.constructors?.length > 0 && { id: 'constructors', label: 'Constructors', Icon: Hammer },
    classData.methods?.length > 0 && { id: 'methods', label: 'Methods', Icon: Code2 },
  ].filter(Boolean);
  
  const basePkg = "com.kaleert.nyagram";
  const fullPackageName = pkg.startsWith('com.') ? pkg : `${basePkg}.${pkg}`;

  return (
    <div style={{
      paddingBottom: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '48px',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        
        <Breadcrumbs pkg={pkg} cls={classData.name} colors={colors} />

        {/* --- CLASS HEADER CARD --- */}
        <div style={{
          background: colors.cardBg,
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '12px',
                width: '100%'
              }}>
                <h1 style={{
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  fontWeight: '800',
                  color: colors.text,
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  hyphens: 'auto',
                  lineHeight: '1.2',
                  textDecoration: classData.deprecated ? 'line-through' : 'none',
                  opacity: classData.deprecated ? 0.6 : 1,
                  margin: 0,
                  marginBottom: '8px'
                }}>
                  {classData.name}
                </h1>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  overflowX: 'auto',
                  paddingBottom: '4px'
                }}>
                  <Badge type={classData.type} isDark={isDark} />
                  {classData.deprecated && <DeprecatedBadge isDark={isDark} />}
                  {classData.since && <SinceBadge version={classData.since} isDark={isDark} />}
                </div>
              
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '14px', fontFamily: '"JetBrains Mono", monospace', color: colors.muted,
                width: '100%' 
              }}>
                <span style={{ color: colors.primary, fontWeight: 'bold', flexShrink: 0 }}>package</span>
                <span 
                    title={fullPackageName}
                    style={{ 
                        wordBreak: 'normal', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0
                    }}
                >
                    {fullPackageName}
                </span>
              </div>

            <a 
              href={`${fileUrl}#L${classData.line || 1}`} 
              target="_blank" 
              rel="noreferrer" 
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: isDark ? '#fff' : 'white',
                background: isDark ? '#333' : '#111827',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background 0.2s',
                marginTop: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = colors.primary}
              onMouseOut={(e) => e.currentTarget.style.background = isDark ? '#333' : '#111827'}
            >
              <Github size={16} />
              <span>Source Code</span>
            </a>
          </div>
          
           {/* TYPE PARAMETERS */}
           {classData.typeParameters && classData.typeParameters.length > 0 && (
             <div style={{
                marginTop: '20px', 
                paddingTop: '16px',
                borderTop: `1px solid ${colors.border}`,
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px'
             }}>
                <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: colors.muted, 
                    textTransform: 'uppercase', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px'
                }}>
                    <BoxSelect size={14} /> Type Parameters
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                    {classData.typeParameters.map((tp, idx) => (
                        <div key={idx} style={{ 
                            fontSize: '14px', 
                            display: 'flex', 
                            gap: '12px',
                            alignItems: 'baseline'
                        }}>
                             <span style={{ 
                                 fontFamily: '"JetBrains Mono", monospace', 
                                 fontWeight: 'bold', 
                                 color: isDark ? '#2dd4bf' : '#0d9488', // Teal color
                                 background: isDark ? 'rgba(45, 212, 191, 0.1)' : '#f0fdfa',
                                 padding: '2px 6px',
                                 borderRadius: '4px',
                                 border: `1px solid ${isDark ? 'rgba(45, 212, 191, 0.2)' : '#ccfbf1'}`
                             }}>
                                &lt;{tp.name}&gt;
                             </span>
                             <span style={{ color: colors.text }}>{tp.description}</span>
                        </div>
                    ))}
                </div>
             </div>
           )}

          {(classData.extendsList?.length > 0 || classData.implementsList?.length > 0) && (
            <div style={{
              marginTop: '24px', paddingTop: '20px',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex', flexDirection: 'column', gap: '8px',
              fontSize: '14px', fontFamily: '"JetBrains Mono", monospace'
            }}>
              {classData.extendsList?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: colors.muted }}>Extends:</span>
                  {classData.extendsList.map((t, i) => (
                    <span key={i} style={{ color: colors.text }}>
                      <TypeLink type={t} />{i < classData.extendsList.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              )}
              {classData.implementsList?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: colors.muted }}>Implements:</span>
                  {classData.implementsList.map((t, i) => (
                    <span key={i} style={{ color: colors.text }}>
                      <TypeLink type={t} />{i < classData.implementsList.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <MobileTOC sections={tocSections} colors={colors} scrollToAnchor={scrollToAnchor} />

        {/* --- DESCRIPTION --- */}
        <div style={{ marginBottom: '40px', color: colors.text }}>
          {classData.description ? (
            <ReactMarkdown
              components={{
                p: ({node, children, ...props}) => (
                  <p style={{ 
                    lineHeight: '1.8', 
                    marginBottom: '1.25rem',
                    overflowWrap: 'anywhere', 
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                  }} {...props}>
                    <span>{children}</span>
                  </p>
                ),
                
                li: ({node, children, ...props}) => (
                  <li style={{
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word'
                  }} {...props}>
                    <span>{children}</span>
                  </li>
                ),
                
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match) {
                    return <EnhancedCodeBlock language={match[1]} theme={syntaxTheme || dracula} isDark={isDark}>{children}</EnhancedCodeBlock>;
                  }
                  return (
                    <code 
                      className="notranslate" 
                      style={{ 
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                        color: isDark ? '#f0f0f0' : '#111827', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.85em',
                        fontFamily: '"JetBrains Mono", monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                        display: 'inline',
                        verticalAlign: 'baseline'
                      }} 
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {classData.description}
            </ReactMarkdown>
          ) : (
            <p style={{ color: colors.muted, fontStyle: 'italic' }}>No description provided.</p>
          )}
        </div>

        {/* --- EXAMPLE --- */}
        {classData.example && (
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '14px', fontWeight: 'bold', color: colors.text,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Book size={18} style={{ color: colors.primary }} /> Usage Example
            </h3>
            <CodeBlock code={classData.example} theme={syntaxTheme} colors={colors} />
          </div>
        )}
        
        {/* --- ENUM CONSTANTS --- */}
        {classData.enumConstants && classData.enumConstants.length > 0 && (
          <div id="enums" style={{ marginBottom: '64px', scrollMarginTop: '96px' }}>
            <SectionHeader title="Enum Constants" icon={ListOrdered} id="enums" onLinkClick={() => handleCopyLink('enums')} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {classData.enumConstants.map((constant, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '16px',
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 'bold',
                    color: colors.primary,
                    fontSize: '16px'
                  }}>
                    {constant.name}
                  </div>
                  {constant.description && (
                    <div style={{ fontSize: '13px', color: colors.muted }}>
                      {constant.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FIELDS --- */}
        {classData.fields && classData.fields.length > 0 && (
          <div id="fields" style={{ marginBottom: '64px', scrollMarginTop: '96px' }}>
            <SectionHeader title="Fields" icon={Hash} id="fields" onLinkClick={() => handleCopyLink('fields')} />
            <div style={{
              border: `1px solid ${colors.border}`, borderRadius: '12px',
              overflow: 'hidden', background: colors.cardBg
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: colors.tableHeaderBg }}>
                    <tr>
                      {['Type', 'Name', 'Description'].map(h => (
                        <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: colors.muted, textTransform: 'uppercase' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classData.fields.map((field, idx) => (
                      <tr 
                        key={idx} 
                        style={{ borderTop: `1px solid ${colors.border}` }}
                      >
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#8b5cf6' }}>
                          <span style={{ color: colors.muted, fontWeight: 'normal', fontSize: '12px', marginRight: '8px' }}>{field.visibility}</span>
                          <TypeLink type={field.type} />
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace', color: colors.text }}>
                          {field.name}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.muted }}>
                          {field.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- CONSTRUCTORS --- */}
        {classData.constructors && classData.constructors.length > 0 && (
          <div id="constructors" style={{ marginBottom: '64px', scrollMarginTop: '96px' }}>
            <SectionHeader title="Constructors" icon={Hammer} id="constructors" onLinkClick={() => handleCopyLink('constructors')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {classData.constructors.map((ctor, idx) => (
                <div key={idx} style={{
                    background: colors.cardBg, 
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`, 
                    padding: '20px',
                    width: '100%',
                    overflow: 'hidden'
                  }}>
                  
                  {/* Signature Code Block */}
                  <div style={{
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    background: colors.codeBg,
                    marginBottom: '20px',
                    width: '100%',
                    overflow: 'hidden'
                  }}>
                    {/* WRAPPER */}
                    <div style={{ 
                        overflowX: 'auto', 
                        width: '100%',
                        WebkitOverflowScrolling: 'touch' 
                    }}>
                        <SyntaxHighlighter 
                          language="java" 
                          style={syntaxTheme}
                          wrapLines={false} 
                          customStyle={{ 
                            margin: 0, 
                            padding: '16px 16px 24px 16px', // PADDING BOTTOM INCREASED
                            fontSize: '13px', 
                            lineHeight: '1.5',
                            background: 'transparent', 
                            fontFamily: '"JetBrains Mono", monospace',
                            minWidth: '100%'
                          }}
                        >
                          {ctor.signature}
                        </SyntaxHighlighter>
                    </div>
                  </div>
        
                  <div style={{ color: colors.muted, fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                    <ReactMarkdown>{ctor.description}</ReactMarkdown>
                  </div>

                  {/* Constructor Parameters Table */}
                  {ctor.parameters && ctor.parameters.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: colors.muted, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Parameters
                      </h4>
                      <div style={{ 
                          background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', 
                          border: `1px solid ${colors.border}`, 
                          borderRadius: '8px', 
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch'
                      }}>
                        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {ctor.parameters.map((p, pIdx) => (
                              <tr 
                                key={pIdx}
                                style={{ borderTop: pIdx > 0 ? `1px solid ${colors.border}` : 'none' }}
                              >
                                <td style={{ padding: '10px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 'bold', color: colors.text, whiteSpace: 'nowrap' }}>
                                  {p.name}
                                </td>
                                <td style={{ padding: '10px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                  <TypeLink type={p.type} />
                                </td>
                                <td style={{ padding: '10px 16px', fontSize: '13px', color: colors.muted, minWidth: '150px' }}>
                                  {p.desc || <span style={{opacity: 0.5}}>-</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* THROWS / EXCEPTIONS (IN CONSTRUCTOR) */}
                  {ctor.exceptions && ctor.exceptions.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Throws
                      </h4>
                      <div style={{ 
                          background: isDark ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2',
                          border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'}`, 
                          borderRadius: '8px', 
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch'
                      }}>
                        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {ctor.exceptions.map((ex, eIdx) => (
                              <tr 
                                key={eIdx}
                                style={{ borderTop: eIdx > 0 ? `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'}` : 'none' }}
                              >
                                <td style={{ padding: '10px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 'bold', color: colors.text, whiteSpace: 'nowrap' }}>
                                  <TypeLink type={ex.type} />
                                </td>
                                <td style={{ padding: '10px 16px', fontSize: '13px', color: colors.muted, minWidth: '150px' }}>
                                  {ex.desc}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- METHODS --- */}
        {classData.methods && classData.methods.length > 0 && (
          <div id="methods" style={{ scrollMarginTop: '96px' }}>
            <SectionHeader title="Methods" icon={Code2} id="methods" onLinkClick={() => handleCopyLink('methods')} />

            {/* Methods Summary Table */}
            <div style={{
              border: `1px solid ${colors.border}`, borderRadius: '12px',
              overflow: 'hidden', background: colors.cardBg, marginBottom: '48px'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: colors.tableHeaderBg }}>
                    <tr>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: colors.muted, textTransform: 'uppercase' }}>Returns</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: colors.muted, textTransform: 'uppercase' }}>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classData.methods.map((method, idx) => (
                      <tr 
                        key={idx}
                        style={{ borderTop: `1px solid ${colors.border}` }}
                      >
                        <td style={{ padding: '12px 24px', width: '25%', verticalAlign: 'top', fontFamily: '"JetBrains Mono", monospace', fontSize: '14px', color: colors.muted }}>
                          <TypeLink type={method.returns.type} />
                        </td>
                        <td style={{ padding: '12px 24px', verticalAlign: 'top' }}>
                          <button 
                            onClick={() => scrollToAnchor(method.anchor)} 
                            style={{
                              textAlign: 'left', fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '14px', color: colors.primary, background: 'none', border: 'none',
                              cursor: 'pointer', padding: 0, textDecoration: method.deprecated ? 'line-through' : 'none',
                              opacity: method.deprecated ? 0.6 : 1
                            }}
                          >
                            {method.name}
                          </button>
                          <div style={{ fontSize: '12px', color: colors.muted, marginTop: '4px' }}>
                            {method.description}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Methods Detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
              {classData.methods.map((method, idx) => (
                <div key={idx} id={method.anchor} style={{ marginBottom: '60px', scrollMarginTop: '120px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '20px', fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace',
                      color: colors.text, textDecoration: method.deprecated ? 'line-through' : 'none',
                      opacity: method.deprecated ? 0.6 : 1, margin: 0, wordBreak: 'break-word', lineHeight: '1.3'
                    }}>
                      {method.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <MethodBadge type={method.tag} isDark={isDark} />
                        {method.deprecated && <DeprecatedBadge isDark={isDark} />}
                        {method.since && <SinceBadge version={method.since} isDark={isDark} />}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a 
                          href={`${fileUrl}#L${method.line || 1}`} 
                          target="_blank" rel="noreferrer" 
                          style={{ 
                            color: colors.muted, display: 'flex', alignItems: 'center', padding: '6px 10px', 
                            borderRadius: '6px', textDecoration: 'none', fontSize: '12px',
                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', border: `1px solid ${colors.border}`
                          }}
                        >
                          <Github size={14} style={{ marginRight: '6px' }} /> Source
                        </a>
                        <button 
                          onClick={() => handleCopyLink(method.anchor)} 
                          style={{ 
                            color: colors.muted, display: 'flex', alignItems: 'center', padding: '6px 10px', 
                            borderRadius: '6px', fontSize: '12px', border: `1px solid ${colors.border}`,
                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', cursor: 'pointer'
                          }}
                        >
                          <LinkIcon size={14} style={{ marginRight: '6px' }} /> Link
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    background: colors.codeBg,
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                        <SyntaxHighlighter 
                          language="java" 
                          style={syntaxTheme}
                          wrapLines={false}
                          customStyle={{ margin: 0, padding: '16px 16px 24px 16px', fontSize: '14px', background: 'transparent', minWidth: '100%' }}
                        >
                          {method.signature}
                        </SyntaxHighlighter>
                    </div>
                  </div>

                  <div style={{ color: colors.text, marginBottom: '24px', fontSize: '16px', lineHeight: '1.6' }}>
                    <ReactMarkdown
                      components={{
                        p: ({node, children, ...props}) => (
                          <p style={{ 
                            lineHeight: '1.8', 
                            marginBottom: '1.25rem',
                            overflowWrap: 'anywhere', 
                            wordBreak: 'break-word',
                            hyphens: 'auto'
                          }} {...props}>
                            <span>{children}</span>
                          </p>
                        ),
                        
                        li: ({node, children, ...props}) => (
                          <li style={{
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word'
                          }} {...props}>
                            <span>{children}</span>
                          </li>
                        ),
                        
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          if (!inline && match) {
                            return <EnhancedCodeBlock language={match[1]} theme={syntaxTheme || dracula} isDark={isDark}>{children}</EnhancedCodeBlock>;
                          }
                          return (
                            <code 
                              className="notranslate" 
                              style={{ 
                                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                                color: isDark ? '#f0f0f0' : '#111827', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '0.85em',
                                fontFamily: '"JetBrains Mono", monospace',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                overflowWrap: 'anywhere',
                                display: 'inline',
                                verticalAlign: 'baseline'
                              }} 
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {classData.description}
                    </ReactMarkdown>
                  </div>

                  {/* Parameters */}
                  {method.parameters && method.parameters.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: colors.muted, textTransform: 'uppercase', marginBottom: '8px' }}>
                        Parameters
                      </h4>
                      <div style={{ 
                          background: colors.cardBg, 
                          border: `1px solid ${colors.border}`, 
                          borderRadius: '8px', 
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch'
                      }}>
                        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {method.parameters.map((p, pIdx) => (
                              <tr 
                                key={pIdx}
                                style={{ borderTop: pIdx > 0 ? `1px solid ${colors.border}` : 'none' }}
                              >
                                <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 'bold', color: colors.text, whiteSpace: 'nowrap' }}>
                                  {p.name}
                                </td>
                                <td style={{ padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: '#8b5cf6', whiteSpace: 'nowrap' }}>
                                  <TypeLink type={p.type} />
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: colors.muted, minWidth: '120px' }}>
                                  {p.desc || <span style={{ opacity: 0.5 }}>-</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* THROWS / EXCEPTIONS */}
                  {method.exceptions && method.exceptions.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Throws
                      </h4>
                      <div style={{ 
                          background: isDark ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2',
                          border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'}`, 
                          borderRadius: '8px', 
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch'
                      }}>
                        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {method.exceptions.map((ex, eIdx) => (
                              <tr 
                                key={eIdx}
                                style={{ borderTop: eIdx > 0 ? `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'}` : 'none' }}
                              >
                                <td style={{ padding: '10px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 'bold', color: colors.text, whiteSpace: 'nowrap' }}>
                                  <TypeLink type={ex.type} />
                                </td>
                                <td style={{ padding: '10px 16px', fontSize: '13px', color: colors.muted, minWidth: '150px' }}>
                                  {ex.desc}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Return Value (REDESIGNED AS TABLE) */}
                  {method.returns.type !== 'void' && (
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Returns
                      </h4>
                      <div style={{ 
                          background: isDark ? 'rgba(22, 163, 74, 0.05)' : '#f0fdf4',
                          border: `1px solid ${isDark ? 'rgba(22, 163, 74, 0.2)' : '#bbf7d0'}`, 
                          borderRadius: '8px', 
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch'
                      }}>
                         <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                                <td style={{ padding: '10px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 'bold', color: colors.text, whiteSpace: 'nowrap' }}>
                                   <TypeLink type={method.returns.type} />
                                </td>
                                <td style={{ padding: '10px 16px', fontSize: '13px', color: colors.muted }}>
                                   {method.returns.desc || "Result of the operation."}
                                </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <PackageNavigation 
          db={db} 
          currentPkg={pkg} 
          currentClsId={cls} 
          colors={colors} 
        />
        
      </div>
      <div className="hidden lg:block" style={{
        position: 'sticky', top: '96px', alignSelf: 'flex-start',
        width: '256px', marginLeft: '24px', paddingLeft: '16px',
        borderLeft: `2px solid ${colors.border}`
      }}>
        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          On this page
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          {tocSections.map(({ id, label, Icon }) => (
             <li key={id}>
                <a 
                  href={`#${id}`} 
                  onClick={(e) => { e.preventDefault(); scrollToAnchor(id); }}
                  style={{ display: 'flex', alignItems: 'center', color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
                >
                  <Icon size={14} style={{ marginRight: '8px', opacity: 0.7 }} /> {label}
                </a>
              </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CodeBlock = ({ code, theme, colors }) => (
  <div style={{
    borderRadius: '12px', overflow: 'hidden',
    border: `1px solid ${colors.border}`, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
    fontSize: '14px', background: colors.codeBg
  }}>
    <SyntaxHighlighter 
      language="java" 
      style={theme}
      customStyle={{ margin: 0, padding: '16px', background: 'transparent' }}
    >
      {code}
    </SyntaxHighlighter>
  </div>
);

const Badge = ({ type, isDark }) => (
  <span style={{
    padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
    borderRadius: '4px', background: isDark ? '#333' : '#111827', color: 'white',
    border: isDark ? '1px solid #555' : 'none'
  }}>
    {type}
  </span>
);

const DeprecatedBadge = ({ isDark }) => (
  <span style={{
    display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px',
    fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '4px',
    background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2', 
    color: '#ef4444', 
    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : '#fecaca'}`
  }}>
    <AlertTriangle size={10} /> Deprecated
  </span>
);

const SinceBadge = ({ version, isDark }) => (
  <span style={{
    display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px',
    fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '4px',
    background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', 
    color: '#3b82f6', 
    border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe'}`
  }}>
    <Clock size={10} /> Since {version}
  </span>
);

const MethodBadge = ({ type, isDark }) => {
  const isApi = type === 'API';
  const styles = isApi 
    ? { 
        bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4', 
        col: '#22c55e', 
        bord: isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0' 
      }
    : { 
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb', 
        col: '#f59e0b', 
        bord: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a' 
      };
    
  return (
    <span style={{
      padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
      borderRadius: '4px', background: styles.bg, color: styles.col, border: `1px solid ${styles.bord}`
    }}>
      {type}
    </span>
  );
};

export default ApiPage;