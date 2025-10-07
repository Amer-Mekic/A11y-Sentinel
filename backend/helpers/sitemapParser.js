import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

/**
 * Fetches and parses a sitemap.xml file to extract all URLs.
 * @param {string} sitemapUrl - The URL of the sitemap.xml file.
 * @returns {Promise<string[]>} - A promise that resolves to an array of URLs.
 */
async function extractUrlsFromSitemap(sitemapUrl) {
    if(sitemapUrl==null) return [];
    const response = await axios.get(sitemapUrl);
    const parser = new XMLParser();
    const parsed = parser.parse(response.data);

    // Handle both sitemap index and regular sitemap
    if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
        // Sitemap index: recursively fetch URLs from child sitemaps
        const sitemaps = Array.isArray(parsed.sitemapindex.sitemap)
            ? parsed.sitemapindex.sitemap
            : [parsed.sitemapindex.sitemap];
        let urls = [];
        for (const sitemap of sitemaps) {
            if (sitemap.loc) {
                const childUrls = await extractUrlsFromSitemap(sitemap.loc);
                urls = urls.concat(childUrls);
            }
        }
        return urls;
    } else if (parsed.urlset && parsed.urlset.url) {
        // Regular sitemap
        const urls = Array.isArray(parsed.urlset.url)
            ? parsed.urlset.url
            : [parsed.urlset.url];
        return urls.map(u => u.loc).filter(Boolean);
    } else {
        return [];
    }
}

export default { extractUrlsFromSitemap };