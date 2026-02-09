import axios from 'axios';
import { URL } from 'url';

import sitemapParser from './sitemapParser.js';
/**
 * Attempts to find the sitemap URL for a given website.
 * Checks common sitemap locations and returns the first valid one found.
 * @param {string} websiteUrl - The base URL of the website (e.g., https://example.com)
 * @returns {Promise<string|null>} - The sitemap URL if found, otherwise null
 */
async function findSitemap(websiteUrl) {
    const candidates = [
        '/sitemap.xml',
        '/sitemap_index.xml',
        '/sitemap-index.xml',
        '/sitemap1.xml',
        '/sitemap/sitemap.xml',
        '/sitemapindex.xml'
    ];

    for (const path of candidates) {
        try {
            const sitemapUrl = new URL(path, websiteUrl).href;
            const response = await axios.head(sitemapUrl, { timeout: 5000 });
            if (response.status === 200 && response.headers['content-type'] && response.headers['content-type'].includes('xml')) {
                return sitemapUrl;
            }
        } catch (err) {
            // Ignore errors and try next candidate
        }
    }

    try {
        const robotsURL = new URL('/robots.txt', websiteUrl).href;
        const response = await axios.get(robotsURL, { timeout: 5000 });
        const lines = response.data.split('\n');
        const sitemapLine = lines.find(line => line.toLowerCase().startsWith('sitemap:'));
        if (!sitemapLine) return null;
        const sitemapUrl = sitemapLine.split(':')[1].trim();
        const responseSitemap = await axios.head(sitemapUrl, { timeout: 5000 });
        if (responseSitemap.status === 200 && responseSitemap.headers['content-type'] && responseSitemap.headers['content-type'].includes('xml')) {
            return sitemapUrl;
        }
    } catch (err) {
        
    }

    return null;
}

//console.log(await findSitemap('https://nasa.gov'))

export default { findSitemap };