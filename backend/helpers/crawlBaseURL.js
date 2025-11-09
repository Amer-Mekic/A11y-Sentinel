import { URL } from 'url';
import https from 'https';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const maxCrawlDepth = 3;
const maxUrls = 10;
const requestTimeout = 10000; // in milliseconds
const crawlDelay = 200; // in milliseconds

/**
 * Fetches URLs from a site, while using delays and max depth to respect and not overload site's servers.
 * @param {string} baseURL - The URL of the website.
 * @returns {Promise<string[]>} - A promise that resolves to an array of URLs.
 */
async function crawlBaseURL(baseURL) {
    try {
        new URL(baseURL);
    } catch (err) {
        throw new Error('Invalid URL');
    }
    const urls = new Set([baseURL]);
    const visited = new Set();
    // Crawl logic:
    while (urls.size > visited.size && visited.size < maxUrls) {
    const currentUrl = Array.from(urls).find(url => !visited.has(url));
    if (!currentUrl) break;

    console.log(`Crawling: ${currentUrl}`);
    try {
        visited.add(currentUrl); 
        const pageUrls = [];       
        https.get(currentUrl, { agent: httpsAgent }, res => {  
            let data = '';
            res.on('data', chunk => { data += chunk; });    
            res.on('end', () => {
                // Extract ALL URLs ('g' -> 'global') from the HTML using regex "https://..."
                const urlRegex = /href="(https:\/\/[^"]+)"/g;
                let match;
                while ((match = urlRegex.exec(data)) !== null) {
                    pageUrls.push(match[1]);
                }
                console.log('Found URLs:', pageUrls);
                });
            }).on('error', err => {
                console.error('Error: ' + err.message);
            });
      // Filter, normalize, and add new URLs that belong to the same domain
      for (const foundUrl of pageUrls) {
        const parsedUrl = new URL(foundUrl);
        const parsedBaseUrl = new URL(baseURL);
        
        // Only add URLs from the same domain to avoid crawling external sites
        if (parsedUrl.hostname === parsedBaseUrl.hostname) {
          // Normalize the URL by removing fragments and query parameters for deduplication
          const normalizedUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
          urls.add(normalizedUrl);
        }
      }
    } catch (error) {
      console.error(`Failed to crawl ${currentUrl}:`, error.message);
      visited.add(currentUrl); // Mark as visited even if it failed
    }
  }
  return Array.from(urls);
}
export default { crawlBaseURL };

