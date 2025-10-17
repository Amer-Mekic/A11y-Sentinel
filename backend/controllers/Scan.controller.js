import { scanQueue } from '../utils/queue.js';

export const startScan = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, urls } = req.body; // Array of URLs to scan

  try {
    // Function to generate a unique scan ID
    // const scanId = generateScanId(); // Will implement later

    const scanId = Date.now().toString(); // Simple scan ID based on timestamp
    // Add all URLs to the queue as separate jobs
    const jobs = await Promise.all(
      urls.map(url => 
        scanQueue.add('accessibility-scan', {
          url,
          projectId,
          scanId,
        })
      )
    );

    res.status(202).json({
      message: 'Scan started',
      scanId,
      totalJobs: jobs.length,
      // Poll for progress using job IDs
      jobIds: jobs.map(job => job.id)
    });

  } catch (error) {
    console.error('Failed to start scan:', error);
    res.status(500).json({ error: 'Failed to start scan' });
  }
}