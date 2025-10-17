import 'dotenv/config';
import { Worker } from 'bullmq';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import processAxeResults from './processAxeResults.js'; 

const worker = new Worker('scanQueue', async (job) => {
  const { url, projectId, scanId } = job.data;
  
  console.log(`Starting scan for: ${url}`);
  
  // Update job progress - for later frontend tracking
  await job.updateProgress(10);
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await job.updateProgress(50);

    const results = await new AxeBuilder({ page }).analyze();
    await job.updateProgress(80);

    const processedResults = processAxeResults(results, url);
    await job.updateProgress(100);

    // Results to be stored in db
    return {
      success: true,
      data: processedResults,
      projectId,
      scanId
    };

  } catch (error) {
    console.error(`Scan failed for ${url}:`, error);
    throw error; // This triggers BullMQ's retry mechanism
  } finally {
    await browser.close();
  }
}, {
  connection: {
    url: process.env.REDIS_URL
  },
  // Process 2 jobs at a time for speed (Weak PC, so can't handle more than 2)
  concurrency: 2
});

// Handle worker events
worker.on('completed', (job) => {
  console.log(`📦 Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 Job ${job.id} failed with ${err.message}`);
});

worker.on('error', (err) => {
  console.error('🚨 Worker error:', err);
});

console.log('Accessibility worker started...');