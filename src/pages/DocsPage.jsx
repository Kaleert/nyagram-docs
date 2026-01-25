import { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Loader2, Info, ChevronRight, Home, ChevronLeft, List, 
  Copy, Check, ChevronDown, ChevronUp, Hash, BookOpen, Star, ExternalLink, ArrowUp
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import NotFoundPage from './NotFoundPage';

const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u0400-\u04FF]+/g, '') 
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const flattenLinks = (items) => {
  let links = [];
  items?.forEach(item => {
    if (item.link && !item.link.startsWith('http')) {
      links.push({ label: item.label, link: item.link });
    }
    if (item.items) {
      links = [...links, ...flattenLinks(item.items)];
    }
  });
  return links;
};

const findPathInSidebar = (sidebar, currentPath) => {
  if (!sidebar) return [];
  const normPath = currentPath.endsWith('/') && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;

  for (const section of sidebar) {
    if (section.link === normPath) {
        return [{ label: section.title, link: null }];
    }
    const searchItems = (items, pathStack) => {
      for (const item of items) {
        const itemLink = item.link?.endsWith('/') && item.link.length > 1 ? item.link.slice(0, -1) : item.link;
        if (itemLink === normPath) {
          return [...pathStack, { label: item.label, link: item.link }];
        }
        if (item.items) {
          const found = searchItems(item.items, [...pathStack, { label: item.label, link: item.link }]);
          if (found) return found;
        }
      }
      return null;
    };
    if (section.items) {
      const path = searchItems(section.items, []);
      if (path) {
        return [{ label: section.title, link: null }, ...path];
      }
    }
  }
  return [];
};

const MobileTOC = ({ headings, isDark, onScroll }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (headings.length === 0) return null;

  return (
    <div className="xl:hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-[#1e1e1e] border-[#333] text-gray-200' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}
      >
        <span className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
          <List size={16} /> On this page
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className={`mt-2 rounded-lg border p-2 flex flex-col gap-1 ${
           isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200'
        }`}>
          {/* Кнопка "Наверх" (если нужно, можно убрать, но удобно) */}
          <button
            onClick={() => { setIsOpen(false); onScroll('TOP'); }}
            className={`text-left block py-2 px-3 text-sm rounded transition-colors font-bold flex items-center gap-2 ${
                isDark ? 'text-gray-400 hover:bg-[#333] hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
             }`}
          >
            <ArrowUp size={14} /> Top of page
          </button>

          {headings.map((h, i) => (
            <button
              key={i}
              onClick={() => {
                setIsOpen(false);
                onScroll(h.id);
              }}
              className={`text-left block py-2 px-3 text-sm rounded transition-colors truncate ${
                 isDark ? 'text-gray-400 hover:bg-[#333] hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
              style={{ 
                paddingLeft: `${(h.level - 1) * 12 + 12}px`,
                fontWeight: h.level === 1 ? 'bold' : 'normal' // Выделяем H1 жирным
              }}
            >
              {h.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EnhancedCodeBlock = ({ language, children, theme, isDark }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`notranslate rounded-xl overflow-hidden my-6 border shadow-sm transition-all ${
      isDark ? 'border-[#333]' : 'border-gray-200'
    }`}>
      <div className={`flex items-center justify-between px-4 py-2 text-xs font-mono border-b ${
        isDark ? 'bg-[#2a2a2a] border-[#333] text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'
      }`}>
        <span className="uppercase font-bold tracking-wider">{language || 'text'}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
               isDark ? 'hover:bg-[#444] hover:text-white' : 'hover:bg-gray-200 hover:text-black'
            }`} title="Copy code">
            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1 rounded transition-colors ${
               isDark ? 'hover:bg-[#444] hover:text-white' : 'hover:bg-gray-200 hover:text-black'
            }`} title={isCollapsed ? "Expand" : "Collapse"}>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="animate-in slide-in-from-top-2 duration-200">
           <SyntaxHighlighter style={theme} language={language} PreTag="div" customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }} wrapLongLines={true}>
            {codeText}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};


const DocsPage = ({ db }) => {
  const location = useLocation();
  const { isDark, syntaxTheme, isAutoScrollEnabled, addNotification } = useSettings();
  
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [headings, setHeadings] = useState([]); 

  const currentPath = location.pathname === '/' ? '/docs/intro' : location.pathname;
  
  const scrollToSection = (id) => {
    if (id === 'TOP' || !id) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, null, window.location.pathname);
        return;
    }

    const element = document.getElementById(id);
    if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        window.history.pushState(null, null, `#${id}`);
    } else {
        console.warn(`Element with id "${id}" not found.`);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(false);

    const fetchUrl = `${currentPath}.md`;

    console.log(`Fetching doc: ${fetchUrl}`);

    fetch(fetchUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error('Not found');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) throw new Error("HTML returned instead of MD");
        return res.text();
      })
      .then((text) => {
        setContent(text);
        
        const lines = text.split('\n');
        const extractedHeadings = lines.filter(line => line.startsWith('#')).map(line => {
            const level = line.match(/^#+/)[0].length;
            const text = line.replace(/^#+\s+/, '').trim()
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/`([^`]+)`/g, '$1');
            return { level, text, id: slugify(text) };
          });
        setHeadings(extractedHeadings);
        setLoading(false);
      })
      .catch((e) => {
        console.warn(`Doc load failed: ${e.message}`);
        setError(true);
        setLoading(false);
      });
  }, [currentPath]);

  const navigationData = useMemo(() => {
    if (!db?.sidebar) return { prev: null, next: null, breadcrumbs: [] };

    let crumbs = findPathInSidebar(db.sidebar, currentPath);
    
    if (crumbs.length === 0) {
        const parts = currentPath.split('/').filter(Boolean);
        crumbs = parts.map((part, index) => ({
            label: part.charAt(0).toUpperCase() + part.slice(1),
            link: '/' + parts.slice(0, index + 1).join('/')
        }));
    }

    let allLinks = [];
    db.sidebar.forEach(section => {
        if (section.type !== 'generated_api') {
            allLinks = [...allLinks, ...flattenLinks(section.items)];
        }
    });
    
    const idx = allLinks.findIndex(i => i.link === currentPath);
    
    return {
      breadcrumbs: crumbs,
      prev: idx > 0 ? allLinks[idx - 1] : null,
      next: idx < allLinks.length - 1 ? allLinks[idx + 1] : null
    };
  }, [db, currentPath]);

  useEffect(() => {
    if (!loading && !error) {
       if (isAutoScrollEnabled) {
           window.scrollTo(0, 0);
       } else {
           setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
           }, 50);
       }
    }
  }, [currentPath, loading, error, isAutoScrollEnabled]);

  if (loading) return <div className="flex h-[50vh] items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Loading...</div>;
  if (error) return <NotFoundPage />;

  const textColor = isDark ? '#e5e7eb' : '#374151';
  const headingColor = isDark ? '#f3f4f6' : '#111827';
  const linkColor = '#E94033';

  const handleAnchorClick = (e, id) => {
      e.preventDefault();
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url)
        .then(() => addNotification("Ссылка скопирована", "success"))
        .catch(err => console.error("Failed to copy:", err));
      
      scrollToSection(id);
  };

  const navBtnStyle = {
    flex: 1, display: 'flex', flexDirection: 'column', padding: '16px',
    background: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
    width: '100%', minWidth: '0', textDecoration: 'none'
  };

  return (
    <div className="flex flex-col xl:flex-row gap-10 max-w-7xl mx-auto px-4 pb-20 animate-in fade-in duration-300">
      
      <div className="flex-1 min-w-0">
        
        {/* Breadcrumbs */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: isDark ? '#9ca3af' : '#6b7280', whiteSpace: 'nowrap' }}>
                <Link to="/" style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <Home size={16} />
                </Link>
                
                {navigationData.breadcrumbs.map((crumb, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                        <ChevronRight size={14} style={{ margin: '0 8px', opacity: 0.5 }} />
                        {crumb.link && i < navigationData.breadcrumbs.length - 1 ? (
                            <Link 
                                to={crumb.link} 
                                style={{ 
                                    color: isDark ? '#a78bfa' : '#7c3aed', 
                                    textDecoration: 'none', fontWeight: 'bold',
                                    borderBottom: '1px dashed transparent'
                                }}
                                onMouseOver={e => e.currentTarget.style.borderBottomColor = 'currentColor'}
                                onMouseOut={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span style={{ color: isDark ? '#f3f4f6' : '#111827', fontWeight: 'bold' }}>
                                {crumb.label}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* ИСПОЛЬЗУЕМ НОВУЮ ВЕРСИЮ MobileTOC */}
        <MobileTOC 
            headings={headings} 
            isDark={isDark} 
            onScroll={scrollToSection} 
        />

        <div className="prose prose-lg max-w-none" style={{ color: textColor }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node, children, ...props}) => <p style={{ lineHeight: '1.8', marginBottom: '1.25rem' }} {...props}><span>{children}</span></p>,
              li: ({node, children, ...props}) => <li {...props}><span>{children}</span></li>,
              
              h1: ({children, ...props}) => {
                const id = slugify(children);
                return (
                    <div className="group relative">
                        <h1 id={id} style={{ color: headingColor, fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', scrollMarginTop: '100px', display: 'flex', alignItems: 'center' }} {...props}>
                            <span>{children}</span>
                            <button onClick={(e) => handleAnchorClick(e, id)} className="text-orange-500 ml-3 opacity-100 cursor-pointer border-none bg-transparent p-0" title="Copy Link">
                                <Hash size={24} />
                            </button>
                        </h1>
                    </div>
                );
              },
              h2: ({children, ...props}) => {
                const id = slugify(children);
                return (
                  <h2 id={id} className="group flex items-center gap-2" style={{ color: headingColor, fontSize: '1.8rem', fontWeight: '700', marginTop: '3rem', marginBottom: '1rem', borderBottom: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, paddingBottom: '0.5rem', scrollMarginTop: '100px' }} {...props}>
                    <span>{children}</span>
                    <button onClick={(e) => handleAnchorClick(e, id)} className="text-orange-500 ml-2 opacity-100 cursor-pointer border-none bg-transparent p-0" title="Copy Link">
                        <Hash size={20} />
                    </button>
                  </h2>
                );
              },
              h3: ({children, ...props}) => {
                const id = slugify(children);
                return (
                    <h3 id={id} className="group flex items-center gap-2" style={{ color: headingColor, fontSize: '1.4rem', fontWeight: '600', marginTop: '2rem', marginBottom: '0.75rem', scrollMarginTop: '100px' }} {...props}>
                        <span>{children}</span>
                        <button onClick={(e) => handleAnchorClick(e, id)} className="text-orange-500 ml-2 opacity-100 cursor-pointer border-none bg-transparent p-0" title="Copy Link">
                            <Hash size={18} />
                        </button>
                    </h3>
                );
              },
              
              blockquote: ({node, children, ...props}) => (
                <div style={{ 
                    borderLeft: '4px solid #F08D43', 
                    background: isDark ? 'rgba(240, 141, 67, 0.1)' : '#fff7ed', 
                    padding: '16px 20px', 
                    borderRadius: '0 8px 8px 0', 
                    margin: '24px 0', 
                    color: textColor,
                    maxWidth: '100%'
                }}>
                    <div className="flex gap-3">
                        <Info className="shrink-0 text-orange-500 mt-1" size={20} />
                        <div className="italic" style={{ minWidth: 0, wordBreak: 'break-word' }}>
                            <span>{children}</span>
                        </div>
                    </div>
                </div>
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
                            wordBreak: 'break-word',
                            display: 'inline-block',
                            verticalAlign: 'middle'
                        }} 
                        {...props}
                    >
                        {children}
                    </code>
                );
              },
              
              a: ({node, href, children, ...props}) => {
                const styles = { color: linkColor, textDecoration: 'none', fontWeight: '500', borderBottom: `1px dashed ${linkColor}` };
                
                if (href?.startsWith('http') || href?.startsWith('mailto')) {
                    return <a href={href} target="_blank" rel="noreferrer" style={styles} className="hover:opacity-80 transition-opacity inline-flex items-center gap-1" {...props}>{children}<ExternalLink size={12} className="opacity-50" /></a>;
                }
                
                if (href?.startsWith('#')) {
                    return <a href={href} onClick={(e) => { e.preventDefault(); scrollToSection(href.substring(1)); }} style={styles} className="hover:opacity-80 transition-opacity cursor-pointer" {...props}>{children}</a>;
                }

                return <Link to={href} style={styles} className="hover:opacity-80 transition-opacity" {...props}>{children}</Link>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* PAGINATION */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '64px', paddingTop: '32px', borderTop: `1px solid ${isDark ? '#333' : '#e5e7eb'}` }}>
          <div className="w-full sm:w-1/2">
            {navigationData.prev ? (
                <Link to={navigationData.prev.link} style={{ ...navBtnStyle, alignItems: 'flex-start', textAlign: 'left' }} className="group hover:border-orange-500">
                <span style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    <ChevronLeft size={10} /> Previous
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <BookOpen size={18} style={{ color: isDark ? '#f3f4f6' : '#111827' }} />
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#f3f4f6' : '#111827' }}>{navigationData.prev.label}</span>
                </div>
                </Link>
            ) : <div />}
          </div>

          <div className="w-full sm:w-1/2 flex justify-end">
            {navigationData.next ? (
                <Link to={navigationData.next.link} style={{ ...navBtnStyle, alignItems: 'flex-end', textAlign: 'right' }} className="group hover:border-orange-500">
                <span style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Next <ChevronRight size={10} />
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', flexDirection: 'row-reverse' }}>
                    <Star size={18} style={{ color: '#E94033' }} />
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#f3f4f6' : '#111827' }}>{navigationData.next.label}</span>
                </div>
                </Link>
            ) : <div />}
          </div>
        </div>

      </div>

      <div className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 custom-scrollbar">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            <List size={14} /> On this page
          </h4>
          <ul className="space-y-3 text-sm border-l" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
            {headings.map((h, i) => (
              <li key={i}>
                <button 
                  onClick={() => scrollToSection(h.id)}
                  className="block text-left w-full py-1 hover:text-orange-500 transition-colors border-l-2 border-transparent hover:border-orange-500 -ml-[2px] leading-snug"
                  style={{ paddingLeft: `${(h.level - 1) * 12 + 16}px`, color: isDark ? '#9ca3af' : '#6b7280' }}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default DocsPage;