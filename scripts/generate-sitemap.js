import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const BASE_URL = 'https://nyagram.kaleert.pro';
const PUBLIC_DIR = './public';
const CONFIG_PATH = path.join(PUBLIC_DIR, 'config.yaml');
const OUT_PATH = path.join('dist', 'sitemap.xml');

const collectUrls = (items, urls) => {
    items.forEach(item => {
        if (item.link && !item.link.startsWith('http')) {
            urls.add(item.link);
        }
        if (item.items) {
            collectUrls(item.items, urls);
        }
    });
};

try {
    console.log('🗺️  Generating Sitemap...');

    const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = yaml.load(fileContents);
    
    const urls = new Set();
    urls.add('/');
    
    if (config.sidebar) {
        collectUrls(config.sidebar, urls);
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls).map(url => {
    const fullUrl = url === '/' ? BASE_URL : `${BASE_URL}${url}`;
    const priority = url === '/' ? '1.0' : '0.8';
    return `  <url>
    <loc>${fullUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }

    fs.writeFileSync(OUT_PATH, sitemapContent);
    console.log(`✅ Sitemap generated at ${OUT_PATH} (${urls.size} links)`);

} catch (e) {
    console.error('❌ Error generating sitemap:', e);
}
