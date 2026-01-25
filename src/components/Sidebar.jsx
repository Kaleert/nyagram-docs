import { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronDown, 
  Folder, FolderOpen, FileCode2, FileText,
  BookOpen, Box, Package, ExternalLink,
  Zap, Star, Heart, Code, Terminal, Settings, Globe, Layout
} from 'lucide-react';
import { LiaLinkSolid, LiaTelegramPlane, LiaVk, LiaCodeBranchSolid, LiaCodepen } from "react-icons/lia";
import { useSettings } from '../context/SettingsContext';

const ICON_MAP = {
  book: BookOpen,
  code: Code,
  box: Box,
  package: Package,
  zap: Zap,
  star: Star,
  heart: Heart,
  terminal: Terminal,
  settings: Settings,
  layout: Layout,
  file: FileText,
  folder: Folder,
  vk: LiaVk,
  redirect: ExternalLink,
  tg: LiaTelegramPlane,
  link: LiaLinkSolid,
  updates: LiaCodepen,
  version: LiaCodeBranchSolid
};

const resolveIcon = (iconName) => {
  if (!iconName) return null;
  if (iconName.includes('/') || iconName.includes('.')) {
    return 'image';
  }
  return ICON_MAP[iconName.toLowerCase()] || FileText;
};

const buildPackageTree = (packages) => {
  const root = {};
  packages?.forEach((pkg) => {
    const parts = pkg.name.split('.');
    let currentLevel = root;
    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {
          key: part,
          fullPath: parts.slice(0, index + 1).join('.'), 
          children: {},
          items: [] 
        };
      }
      if (index === parts.length - 1) {
        currentLevel[part].items = pkg.items || [];
      }
      currentLevel = currentLevel[part].children;
    });
  });
  return root;
};

const Sidebar = ({ isOpen, data }) => {
  const { isDark } = useSettings();
  const packageTree = useMemo(() => buildPackageTree(data?.packages), [data]);

  const openSettings = () => {
    window.dispatchEvent(new Event('open-settings'));
  };

  const colors = {
    bg: isDark ? '#1e1e1e' : '#ffffff',
    text: isDark ? '#f3f4f6' : '#111827',
    muted: isDark ? '#9ca3af' : '#6b7280',
    border: isDark ? '#333' : '#e5e7eb',
    hoverBg: isDark ? '#2a2a2a' : '#f9fafb',
    primary: '#E94033',
    secondary: '#F08D43',
    activeBg: isDark ? 'rgba(233, 64, 51, 0.1)' : 'rgba(233, 64, 51, 0.05)'
  };

  const sidebarConfig = data?.sidebar || [];

  return (
    <aside style={{
      position: 'fixed', top: '64px', left: 0, zIndex: 40,
      width: '288px', height: 'calc(100vh - 4rem)',
      background: colors.bg, borderRight: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column', 
      transition: 'transform 0.3s ease-in-out',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    }}>
      
      {/* SCROLLABLE CONTENT */}
      <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px', 
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? '#333 transparent' : '#e5e7eb transparent',
          display: 'flex', flexDirection: 'column', gap: '12px' 
      }}>
        {sidebarConfig.map((section, idx) => (
          <SidebarSection 
            key={idx} 
            section={section} 
            tree={packageTree} 
            colors={colors}
          />
        ))}
      </div>

      {/* FIXED FOOTER (SETTINGS) */}
      <div style={{ 
          padding: '16px', 
          borderTop: `1px solid ${colors.border}`,
          background: colors.bg 
      }}>
        <button 
            onClick={openSettings}
            style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                color: colors.text,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500',
                fontSize: '14px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.color = colors.primary;
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.text;
            }}
        >
            <Settings size={18} style={{ marginRight: '10px' }} />
            <span>Settings & Language</span>
        </button>
      </div>

    </aside>
  );
};

const SidebarSection = ({ section, tree, colors }) => {
  const [isExpanded, setIsExpanded] = useState(section.collapsed !== true);
  
  const Icon = resolveIcon(section.icon) || (section.icon === 'book' ? BookOpen : Box);
  const isImage = Icon === 'image';

  if (section.type === "generated_api") {
    return (
      <div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex', alignItems: 'center', width: '100%',
            padding: '8px', marginBottom: '4px',
            fontSize: '12px', fontWeight: 'bold', color: colors.muted,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
          onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
        >
          {typeof Icon !== 'string' && <Icon size={14} style={{ marginRight: '8px' }} />}
          {section.title}
          <span style={{ marginLeft: 'auto', opacity: 1 }}>
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        </button>

        {isExpanded && tree && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '4px' }}>
            <SidebarLink to="/api" label="All Packages" colors={colors} icon={Package} isRoot={true} />
            {Object.values(tree).map((node) => (
              <TreeNode key={node.fullPath} node={node} level={0} colors={colors} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if ((!section.items || section.items.length === 0) && section.link) {
    const isExternal = section.link.startsWith('http');
    
    const headerStyle = {
      display: 'flex', alignItems: 'center', width: '100%',
      padding: '8px', marginBottom: '4px',
      fontSize: '12px', fontWeight: 'bold', color: colors.muted,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      background: 'transparent', border: 'none', cursor: 'pointer',
      textDecoration: 'none', transition: 'color 0.2s'
    };

    const content = (
      <>
        {isImage ? (
           <img src={section.icon} alt="" style={{ width: '14px', height: '14px', marginRight: '8px' }} />
        ) : (
           typeof Icon !== 'string' && <Icon size={14} style={{ marginRight: '8px' }} />
        )}
        {section.title}
        {isExternal && <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
      </>
    );

    if (isExternal) {
      return (
        <a 
          href={section.link} target="_blank" rel="noreferrer" 
          style={headerStyle}
          onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
          onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
        >
          {content}
        </a>
      );
    }

    return (
      <NavLink 
        to={section.link} 
        style={({ isActive }) => ({
          ...headerStyle,
          color: isActive ? colors.primary : colors.muted
        })}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex', alignItems: 'center', width: '100%',
          padding: '8px', marginBottom: '4px',
          fontSize: '12px', fontWeight: 'bold', color: colors.muted,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
        onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
      >
        {isImage ? (
           <img src={section.icon} alt="" style={{ width: '14px', height: '14px', marginRight: '8px' }} />
        ) : (
           typeof Icon !== 'string' && <Icon size={14} style={{ marginRight: '8px' }} />
        )}
        {section.title}
        
        <span style={{ marginLeft: 'auto', opacity: 1 }}>
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </button>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {section.items?.map((item, idx) => (
            <DocItem key={idx} item={item} level={0} colors={colors} />
          ))}
        </div>
      )}
    </div>
  );
};

const DocItem = ({ item, level, colors }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.items && item.items.length > 0;
  
  useEffect(() => {
    if (hasChildren) {
      const isChildActive = (children) => children.some(child => 
        (child.link && location.pathname === child.link) || (child.items && isChildActive(child.items))
      );
      if (isChildActive(item.items)) setIsOpen(true);
    }
  }, [location.pathname, hasChildren, item.items]);

  const Icon = resolveIcon(item.icon);
  const isImage = Icon === 'image';
  const paddingLeft = `${12 + level * 12}px`;
  const isActive = item.link && location.pathname === item.link;

  const commonStyle = {
    display: 'flex', alignItems: 'center', width: '100%',
    padding: `8px 12px 8px ${paddingLeft}`,
    fontSize: '14px', borderRadius: '6px',
    color: isActive ? colors.primary : colors.text,
    background: isActive ? colors.activeBg : 'transparent',
    fontWeight: isActive ? '600' : '400',
    textDecoration: 'none', border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative'
  };

  const renderIcon = () => {
    if (!item.icon) return null;
    if (isImage) return <img src={item.icon} alt="" style={{ width: '16px', height: '16px', marginRight: '8px', objectFit: 'contain' }} />;
    return <Icon size={16} style={{ marginRight: '8px', opacity: isActive ? 1 : 0.7 }} />;
  };

  if (hasChildren) {
    return (
      <>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={commonStyle}
          onMouseOver={(e) => !isActive && (e.currentTarget.style.background = colors.hoverBg)}
          onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
        >
          {renderIcon()}
          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {isOpen && (
          <div style={{ position: 'relative' }}>
             <div style={{ position: 'absolute', left: `${parseInt(paddingLeft) + 19}px`, top: 0, bottom: 0, width: '1px', background: colors.hoverBg }} />
             {item.items.map((child, idx) => (
                <DocItem key={idx} item={child} level={level + 1} colors={colors} />
             ))}
          </div>
        )}
      </>
    );
  }

  if (item.link?.startsWith('http')) {
    return (
      <a 
        href={item.link} target="_blank" rel="noreferrer"
        style={commonStyle}
        onMouseOver={(e) => !isActive && (e.currentTarget.style.background = colors.hoverBg)}
        onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
      >
        {renderIcon()}
        <span style={{ flex: 1 }}>{item.label}</span>
        <ExternalLink size={12} style={{ opacity: 0.5 }} />
      </a>
    );
  }

  return (
    <NavLink 
      to={item.link || '#'}
      style={commonStyle}
      onMouseOver={(e) => !isActive && (e.currentTarget.style.background = colors.hoverBg)}
      onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
    >
      {renderIcon()}
      {item.label}
    </NavLink>
  );
};

const SidebarLink = ({ to, label, colors, icon: Icon, isRoot }) => {
  const location = useLocation();
  const isActive = isRoot ? location.pathname === to : location.pathname === to;

  return (
    <NavLink 
      to={to} end={isRoot}
      style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        fontSize: '14px', borderRadius: '8px', textDecoration: 'none',
        transition: 'all 0.2s', marginBottom: '2px',
        background: isActive ? colors.activeBg : 'transparent',
        color: isActive ? colors.primary : colors.muted,
        fontWeight: isActive ? '600' : '400'
      }}
      onMouseOver={(e) => !isActive && (e.currentTarget.style.background = colors.hoverBg)}
      onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
    >
      {Icon && <Icon size={16} style={{ marginRight: '8px', opacity: isActive ? 1 : 0.7 }} />}
      {label}
    </NavLink>
  );
};

const TreeNode = ({ node, level, colors }) => {
  const { isAutoScrollEnabled } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const activeItemRef = useRef(null);
  
  const hasChildren = Object.keys(node.children).length > 0;
  const hasClasses = node.items && node.items.length > 0;
  const nodeUrl = `/api/${node.fullPath.replace(/\./g, '/')}`;
  const isActivePath = location.pathname.includes(nodeUrl);
  const isExactPackage = location.pathname === nodeUrl;
  const [isOpen, setIsOpen] = useState(isActivePath);

  useEffect(() => {
    if (isActivePath) setIsOpen(true);
  }, [location.pathname, isActivePath]);

  useEffect(() => {
    if (isAutoScrollEnabled && (isExactPackage || isActivePath) && activeItemRef.current) {
       activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [location.pathname, isAutoScrollEnabled]);

  if (!hasChildren && !hasClasses) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleNav = (e) => {
    e.preventDefault();
    navigate(nodeUrl);
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ userSelect: 'none' }}>
      <div 
        ref={isExactPackage ? activeItemRef : null}
        style={{
          display: 'flex', alignItems: 'center', width: '100%',
          borderRadius: '8px', transition: 'all 0.2s', margin: '2px 0',
          paddingRight: '8px', paddingLeft: `${level * 12}px`,
          background: isExactPackage ? colors.activeBg : 'transparent'
        }}
        onMouseOver={(e) => !isExactPackage && (e.currentTarget.style.background = colors.hoverBg)}
        onMouseOut={(e) => !isExactPackage && (e.currentTarget.style.background = 'transparent')}
      >
        <button 
          onClick={handleToggle}
          style={{
            padding: '8px', color: colors.muted, background: 'transparent',
            border: 'none', cursor: 'pointer', transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = colors.primary}
          onMouseOut={(e) => e.currentTarget.style.color = colors.muted}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <a 
          href={nodeUrl} onClick={handleNav}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', padding: '8px 0',
            cursor: 'pointer', minWidth: 0, textDecoration: 'none',
            color: isExactPackage ? colors.primary : colors.muted,
            fontWeight: isExactPackage ? '600' : '400'
          }}
          onMouseOver={(e) => !isExactPackage && (e.currentTarget.style.color = colors.text)}
          onMouseOut={(e) => !isExactPackage && (e.currentTarget.style.color = colors.muted)}
        >
          <span style={{ marginRight: '8px', flexShrink: 0, color: isExactPackage ? colors.primary : colors.muted }}>
            {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
          </span>
          <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.key}
          </span>
        </a>
      </div>

      {isOpen && (
        <div style={{ borderLeft: `1px solid ${colors.hoverBg}`, marginLeft: '15px' }}>
          {Object.values(node.children).map((childNode) => (
            <TreeNode key={childNode.fullPath} node={childNode} level={level + 1} colors={colors} />
          ))}

          {node.items.map((item) => {
            const itemUrl = `${nodeUrl}/${item.id}`;
            const isItemActive = location.pathname === itemUrl;
            return (
              <NavLink
                key={item.id} to={itemUrl}
                ref={isItemActive ? (el) => { if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } : null}
                style={{
                  display: 'flex', alignItems: 'center', padding: '8px 8px 8px 0',
                  fontSize: '13px', borderRadius: '0 8px 8px 0', transition: 'all 0.2s',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: 'none', position: 'relative',
                  paddingLeft: `${(level + 1) * 12 + 16}px`,
                  color: isItemActive ? colors.primary : colors.muted,
                  fontWeight: isItemActive ? '500' : '400',
                  background: isItemActive ? colors.activeBg : 'transparent'
                }}
                onMouseOver={(e) => !isItemActive && (e.currentTarget.style.background = colors.hoverBg)}
                onMouseOut={(e) => !isItemActive && (e.currentTarget.style.background = 'transparent')}
              >
                {isItemActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '4px', bottom: '4px', width: '2px',
                    background: `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary})`,
                    borderRadius: '1px'
                  }} />
                )}
                <FileCode2 size={14} style={{ marginRight: '8px', opacity: 0.5, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;