import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Box, Code, Type, BookOpen, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import MiniSearch from 'minisearch';
import { enrichText } from '../utils/synonyms';

const splitCamelCase = (str) => str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

const SearchDialog = ({ data, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const { isDark } = useSettings();
  
  const colors = {
    bg: isDark ? '#1e1e1e' : '#ffffff',
    text: isDark ? '#f3f4f6' : '#111827',
    muted: isDark ? '#9ca3af' : '#6b7280',
    border: isDark ? '#374151' : '#e5e7eb',
    hoverBg: isDark ? '#2a2a2a' : '#f3f4f6',
  };

  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['title', 'keywords', 'text'],
      storeFields: ['title', 'subtitle', 'type', 'link', 'desc'],
      searchOptions: {
        boost: { title: 4, keywords: 3, text: 1 },
        prefix: true,
        fuzzy: 0.2
      }
    });

    const docs = [];
    let idCounter = 0;

    if (data.docsContent) {
        data.docsContent.forEach(doc => {
            docs.push({
                id: idCounter++,
                type: 'doc',
                title: doc.title,
                subtitle: 'Guide',
                keywords: enrichText(doc.title), 
                text: doc.rawText.substring(0, 1000),
                link: doc.link,
                desc: doc.rawText.substring(0, 100) + "..."
            });
        });
    }

    if (data.packages) {
      data.packages.forEach(pkg => {
        pkg.items.forEach(cls => {
          
          docs.push({
            id: idCounter++,
            type: 'class',
            title: cls.name,
            subtitle: `Class in ${pkg.name}`,
            keywords: enrichText(cls.name), 
            text: cls.description || '',
            link: `/api/${pkg.name}/${cls.id}`,
            desc: cls.description
          });

          cls.methods.forEach(method => {
            const params = method.parameters.map(p => p.name).join(' ');
            
            docs.push({
              id: idCounter++,
              type: 'method',
              title: method.name,
              subtitle: `${cls.name}.${method.name}`,
              keywords: `${enrichText(method.name)} ${enrichText(params)}`,
              text: method.description || '',
              link: `/api/${pkg.name}/${cls.id}#${method.anchor}`,
              desc: method.description
            });
          });
          
           cls.fields?.forEach(field => {
             docs.push({
               id: idCounter++,
               type: 'field',
               title: field.name,
               subtitle: `Field in ${cls.name}`,
               keywords: `${enrichText(field.name)} ${field.type}`,
               text: field.description || '',
               link: `/api/${pkg.name}/${cls.id}#fields`,
               desc: field.description
             });
           });
        });
      });
    }

    ms.addAll(docs);
    return ms;
  }, [data]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const searchResults = miniSearch.search(query);
    
    setResults(searchResults.slice(0, 50));
  }, [query, miniSearch]);

  const handleSelect = (hit) => {
    navigate(hit.link);
    onClose();
  };

  const getIcon = (type) => {
    switch(type) {
        case 'doc': return <BookOpen size={18} className="text-blue-500" />;
        case 'class': return <Box size={18} className="text-orange-500" />;
        case 'method': return <Code size={18} className="text-purple-500" />;
        case 'field': return <Type size={18} className="text-green-500" />;
        default: return <Box size={18} />;
    }
  };

  const Highlight = ({ text, match }) => {
      if (!match || !text) return text;
      return text; 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 backdrop-blur-sm transition-all animate-in fade-in duration-200" 
         style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }}
         onClick={onClose}>
      
      <div className="w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-[#333] flex flex-col max-h-[70vh] overflow-hidden relative" 
           onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center border-b border-gray-200 dark:border-[#333] p-4 gap-3 shrink-0">
          <Search className="text-gray-400" size={22} />
          <input 
            autoFocus
            className="flex-1 outline-none text-lg bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            placeholder="Search API (e.g. 'айди чата', 'send photo')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
          {results.length === 0 && query && (
            <div className="p-8 text-center text-gray-500">
               Ничего не найдено.
            </div>
          )}
          
          {results.map((hit) => (
            <button
              key={hit.id}
              onClick={() => handleSelect(hit)}
              className="w-full text-left px-4 py-3 mb-1 rounded-lg flex items-start gap-4 group transition-all hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            >
              <div className="mt-1 p-1.5 rounded-md bg-gray-200 dark:bg-[#333] shrink-0">
                {getIcon(hit.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate pr-2 text-gray-800 dark:text-gray-200 font-mono">
                        {hit.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold opacity-40 border border-gray-400 dark:border-gray-600 rounded px-1.5 text-gray-500 dark:text-gray-400">
                        {hit.type}
                    </span>
                </div>
                
                <div className="text-xs font-mono mt-0.5 mb-1 text-[#E94033] truncate">
                  {hit.subtitle}
                </div>
                
                {hit.desc && (
                    <div className="text-xs line-clamp-2 text-gray-500 dark:text-gray-400 opacity-80">
                        {hit.desc}
                    </div>
                )}
              </div>
              <ArrowRight size={16} className="mt-2 opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all text-gray-500 dark:text-gray-400" />
            </button>
          ))}
        </div>
        
        <div className="p-2 text-[10px] text-center text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-[#333]">
           Powered by MiniSearch. Supports Fuzzy & Multilingual queries.
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;