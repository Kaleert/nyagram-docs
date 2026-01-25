import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import yaml from 'js-yaml';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ApiRouter from './components/ApiRouter';
import DocsPage from './pages/DocsPage';
import PackagePage from './pages/PackagePage';
import SettingsDialog from './components/SettingsDialog';
import Footer from './components/Footer';
import NotificationContainer from './components/NotificationContainer';
import { typeCache } from './components/TypeLink'; 
import { useSettings } from './context/SettingsContext';
import ProgressBar from './components/ProgressBar';

const stripMarkdown = (md) => {
    if (!md) return "";
    return md
        .replace(/#+\s/g, '')
        .replace(/`{3}[\s\S]*?`{3}/g, '')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~]/g, '')
        .replace(/\n/g, ' ')
        .substring(0, 5000);
};

function App() {
  const { isDark, isSettingsOpen, setSettingsOpen } = useSettings();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [apiRes, configRes] = await Promise.all([
          fetch('/data/api.yaml'),
          fetch('/config.yaml')
        ]);

        if (!apiRes.ok) throw new Error(`Не удалось загрузить /data/api.yaml`);
        
        const apiText = await apiRes.text();
        const configText = configRes.ok ? await configRes.text() : "";

        const apiData = yaml.load(apiText);
        
        apiData.packages.forEach(pkg => {
            pkg.items.forEach(cls => {
              const urlPkg = pkg.name.replace(/\./g, '/');
              typeCache[cls.name] = `/api/${urlPkg}/${cls.id}`;
            });
         });
        
        const configData = configText ? yaml.load(configText) : {};
        
        const docsContent = [];
        
        const collectLinks = (items) => {
            let links = [];
            items?.forEach(item => {
                if (item.link && !item.link.startsWith('http') && !item.link.includes('api')) {
                    links.push(item);
                }
                if (item.items) links = [...links, ...collectLinks(item.items)];
            });
            return links;
        };

        const docLinks = collectLinks(configData.sidebar);

        const contentPromises = docLinks.map(async (item) => {
            try {
                const res = await fetch(`${item.link}.md`);
                if (res.ok) {
                    const text = await res.text();
                    docsContent.push({
                        title: item.label,
                        link: item.link,
                        rawText: stripMarkdown(text)
                    });
                }
            } catch (e) { /* ignore missing files */ }
        });

        await Promise.all(contentPromises);

        setData({
          ...apiData,
          sidebar: configData.sidebar || [],
          metadata: { ...apiData.metadata, ...configData.metadata },
          docsContent: docsContent
        });

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        const loader = document.getElementById('console-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
        document.body.style.overflow = 'auto';
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-red-50 dark:bg-[#121212]">
        <h2 className="text-2xl font-bold text-red-600 mb-2">System Error</h2>
        <p className="text-gray-800 dark:text-gray-300 font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDark ? '#121212' : '#ffffff',
      color: isDark ? '#f3f4f6' : '#111827',
      transition: 'background-color 0.3s ease'
    }}>
      <Router>
        <ProgressBar /> 
        <div className="min-h-screen flex flex-col">
          <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} data={data} />
          
          <Sidebar isOpen={isSidebarOpen} data={data} />
          {isSettingsOpen && <SettingsDialog onClose={() => setSettingsOpen(false)} />}

          <main className="lg:pl-72 pt-16 flex-1 flex flex-col">
            <div className="flex-1 w-full max-w-[100vw] px-4 py-8 md:px-8 lg:px-12 mx-auto overflow-x-hidden">
               <div className="max-w-7xl mx-auto w-full">
                  <Routes>
                    {/* 1. Главная страница */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* 2. API Браузер */}
                    <Route path="/api/*" element={<ApiRouter db={data} />} />
                    <Route path="/api" element={<PackagePage db={data} currentPkg="" />} />
                    
                    <Route path="*" element={<DocsPage db={data} />} />
                  </Routes>
               </div>
            </div>
            <Footer data={data} />
          </main>
          <NotificationContainer />
        </div>
      </Router>
    </div>
  );
}

export default App;