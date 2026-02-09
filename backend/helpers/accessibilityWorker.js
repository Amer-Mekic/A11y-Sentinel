import 'dotenv/config';
import { Worker } from 'bullmq';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import processAxeResults from './processAxeResults.js'; 
import prisma from '../database/init.js';

const worker = new Worker('scanQueue', async (job) => {
  const { url, projectId, scanId } = job.data;
  
  console.log(`Starting scan for: ${url}`);
  
  // Update job progress - for later frontend tracking
  await job.updateProgress(10);
  await prisma.scan.update({
      where: { id: scanId },
      data: { status: prisma.scanStatus.IN_PROGRESS }
    })
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await job.updateProgress(50);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: prisma.scanStatus.RUNNING }
    })
    const results = await new AxeBuilder({ page }).analyze();
    await job.updateProgress(80);

    const processedResults = processAxeResults(results, url);
    await job.updateProgress(100);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: prisma.scanStatus.COMPLETED }
    })
    await prisma.scanResult.create({
      data: {
        scanId:scanId,
        pageUrl: url,
        errorCount:processedResults.summary.errorCount,
        warnings: processedResults.summary.warningCount,
        score: processedResults.summary.score,
        violations: JSON.stringify(processedResults.violations, null, 2),
        createdAt: new Date()
      }
    });
    await prisma.scan.update({
      where: { id: scanId },
      data: { score: processedResults.summary.score }
    })
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
  console.log(`Job ${job.id} completed!`);
  console.log('Scan Results:');
  console.log(job.returnvalue.data);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with ${err.message}`);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('Accessibility worker started...');