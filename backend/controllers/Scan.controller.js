import { scanQueue } from '../utils/queue.js';

/**
 * Creates a new project for a user.
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing cookie and project details in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const startScan = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, urls } = req.body; // Array of URLs to scan

  try {
    const jobs = await Promise.all(
      urls.map(url => 
        scanQueue.add('accessibility-scan', {
          url,
          projectId,
          scanId: Date.now()
        })
      )
    );

    await prisma.scan.create({
      data:{
        status: prisma.scanStatus.PENDING,
        projectId,
        createdAt: Date.now()
      }
    })
    
    res.status(202).json({
      message: 'Scan started',
      totalJobs: jobs.length,
      // Poll for progress using job IDs
      jobIds: jobs.map(job => job.id)
    });
  } catch (error) {
    await prisma.scan.create({
      data:{
        status: prisma.scanStatus.FAILED,
        projectId,
        score:0,
        createdAt: Date.now()
      }
    })
    console.error('Failed to start scan:', error);
    res.status(500).json({ error: 'Failed to start scan' });
  }
}