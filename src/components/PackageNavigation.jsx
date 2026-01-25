import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Folder, FileCode2, Home, Box } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const PackageNavigation = ({ db, currentPkg, currentClsId, colors }) => {
  const navigate = useNavigate();
  const { isAutoScrollEnabled } = useSettings();

  const navData = useMemo(() => {
    if (!db || !db.packages) return null;

    const realPackagesMap = new Map(db.packages.map(p => [p.name, p]));

    const allPackageNames = new Set();
    
    db.packages.forEach(pkg => {
      const parts = pkg.name.split('.');
      for (let i = 1; i <= parts.length; i++) {
        allPackageNames.add(parts.slice(0, i).join('.'));
      }
    });

    const sortedPackageNames = Array.from(allPackageNames).sort();

    const flatNodes = [
      {
        type: 'root',
        name: 'API Reference',
        fullName: 'root',
        path: '',
        desc: 'Start'
      }
    ];

    sortedPackageNames.forEach(pkgName => {
      const isReal = realPackagesMap.has(pkgName);
      const pkgPath = pkgName.replace(/\./g, '/');
      const shortName = pkgName.split('.').pop();

      flatNodes.push({
        type: 'package',
        name: shortName,
        fullName: pkgName,
        path: pkgPath,
        desc: isReal ? 'Package' : 'Folder',
        isVirtual: !isReal
      });

      if (isReal) {
        const pkgData = realPackagesMap.get(pkgName);
        pkgData.items.forEach(item => {
          flatNodes.push({
            type: 'file',
            name: item.name,
            fullName: item.name,
            pkgName: pkgName,
            id: item.id,
            path: `${pkgPath}/${item.id}`,
            desc: `Class in ${pkgName}`
          });
        });
      }
    });

    const currentIndex = flatNodes.findIndex(node => {
      if (currentClsId) {
        return node.type === 'file' && node.id === currentClsId && node.pkgName === currentPkg;
      } else if (currentPkg) {
        return node.type === 'package' && node.fullName === currentPkg;
      } else {
        return node.type === 'root';
      }
    });
    
    if (currentIndex === -1) return null;

    return {
      prev: currentIndex > 0 ? flatNodes[currentIndex - 1] : null,
      next: currentIndex < flatNodes.length - 1 ? flatNodes[currentIndex + 1] : null
    };
  }, [db, currentPkg, currentClsId]);

  if (!navData) return null;

  const NavButton = ({ item, direction }) => {
    const isPkg = item.type === 'package';
    const isRoot = item.type === 'root';
    
    let Icon = FileCode2;
    if (isRoot) Icon = Home;
    else if (isPkg) Icon = item.isVirtual ? Folder : Box; // Folder для папок, Box для пакетов

    return (
      <button
        onClick={() => {
          navigate(`/api/${item.path}`);
        }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: direction === 'prev' ? 'flex-start' : 'flex-end',
          textAlign: direction === 'prev' ? 'left' : 'right',
          padding: '16px',
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '0',
          maxWidth: '50%',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = colors.primary;
          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}1a`;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ 
          fontSize: '11px', 
          color: colors.muted, 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
          {direction === 'prev' && <ChevronLeft size={10} />}
          {direction === 'prev' ? 'Previous' : 'Next'}
          {direction === 'next' && <ChevronRight size={10} />}
        </span>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          width: '100%',
          flexDirection: direction === 'prev' ? 'row' : 'row-reverse'
        }}>
           <span style={{ 
             color: (isPkg || isRoot) ? colors.primary : colors.text,
             opacity: (isPkg || isRoot) ? 1 : 0.7 
           }}>
             <Icon size={18} />
           </span>
           
           <span style={{ 
             fontSize: '14px', 
             fontWeight: 'bold', 
             color: colors.text,
             whiteSpace: 'nowrap',
             overflow: 'hidden',
             textOverflow: 'ellipsis'
           }}>
             {item.name}
           </span>
        </div>
        
        <span style={{
          fontSize: '10px',
          color: colors.muted,
          marginTop: '4px',
          fontFamily: (isPkg || isRoot) ? 'inherit' : 'monospace',
          opacity: 0.7,
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
           {isRoot ? "Library Root" : (isPkg ? (item.isVirtual ? "Folder" : "Package") : item.pkgName)}
        </span>
      </button>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      marginTop: '64px', 
      paddingTop: '32px', 
      borderTop: `1px solid ${colors.border}` 
    }}>
      {navData.prev ? <NavButton item={navData.prev} direction="prev" /> : <div style={{ flex: 1 }} />}
      {navData.next ? <NavButton item={navData.next} direction="next" /> : <div style={{ flex: 1 }} />}
    </div>
  );
};

export default PackageNavigation;