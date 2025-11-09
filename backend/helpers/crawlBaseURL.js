import { URL } from 'url';
import https from 'https';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const maxCrawlDepth = 3;
const maxUrls = 3;
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

    const urls = new Map(); // for depth tracking
    const visited = new Set();
    urls.set(baseURL, 0);

    // Crawl logic:
    while (urls.size > visited.size && visited.size < maxUrls) {
        // Find the next URL to crawl (BFS-like by taking the one with smallest depth)
        let currentUrl = null;
        let currentDepth = 0;
        
        for (const [url, depth] of urls) {
            if (!visited.has(url)) {
                currentUrl = url;
                currentDepth = depth;
                break;
            }
        }
        
        if (!currentUrl) break;

        // Respect crawl delay (except for first request)
        if (visited.size > 0) {
            await new Promise(resolve => setTimeout(resolve, crawlDelay));
        }

        console.log(`Crawling: ${currentUrl} (depth: ${currentDepth})`);
        
        try {
            visited.add(currentUrl);
              const pageUrls = await new Promise((resolve, reject) => {
                // Start timer for 10 seconds to complete request, 
                // not to end up waiting for the server forever
                const timeoutId = setTimeout(() => {
                    req.destroy();
                    reject(new Error(`Request timeout after ${requestTimeout}ms`));
                }, requestTimeout);

                const req = https.get(currentUrl, { agent: httpsAgent }, res => {
                    let data = '';
                    res.on('data', chunk => { data += chunk; });
                    res.on('end', () => {
                        clearTimeout(timeoutId);
                        // Extract ALL URLs from the HTML
                        const urlRegex = /href="(https:\/\/[^"]+)"/g;
                        const foundUrls = [];
                        let match;
                        while ((match = urlRegex.exec(data)) !== null) {
                            foundUrls.push(match[1]);
                        }
                        console.log('Found URLs:', foundUrls);
                        resolve(foundUrls);
                    });
                });

                req.on('error', err => {
                    clearTimeout(timeoutId);
                    reject(err);
                });
            });

            // Filter, normalize, and add new URLs that belong to the same domain
            for (const foundUrl of pageUrls) {
                try {
                    const parsedUrl = new URL(foundUrl);
                    const parsedBaseUrl = new URL(baseURL);
                    
                    // Only add URLs from the same domain
                    if (parsedUrl.hostname === parsedBaseUrl.hostname) {
                        // Normalize the URL
                        const normalizedUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
                        
                        // Only add if we haven't seen it and we're within depth limit
                        if (!urls.has(normalizedUrl) && currentDepth < maxCrawlDepth) {
                            urls.set(normalizedUrl, currentDepth + 1);
                        }
                    }
                } catch (err) {
                    console.error(`Invalid URL found: ${foundUrl}`);
                }
            }
        } catch (error) {
            console.error(`Failed to crawl ${currentUrl}:`, error.message);
        }
    }
    let result = Array.from(urls.keys()).slice(1, maxUrls + 1); // Exclude the baseURL itself
    console.log( "All urls: ");
    return result;
}
//let site = 'https://www.nasa.gov/  ';
//console.log(await crawlBaseURL(site));
export default { crawlBaseURL };