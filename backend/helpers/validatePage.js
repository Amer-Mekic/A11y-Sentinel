import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

async function analyzeAccessibility(url) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle' });

        const results = await new AxeBuilder({ page }).analyze();

        return results.violations;
    } finally {
        await browser.close();
    }
}

// Example usage:
console.log('processin...');
const url = process.argv[2];
if (!url) {
    console.error('Usage: node validatePage.js <url>');
    process.exit(1);
}

analyzeAccessibility(url)
    .then(violations => {
        console.log(JSON.stringify(violations[0], "non", 2));
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

export default analyzeAccessibility;