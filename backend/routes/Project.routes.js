import express from 'express';
import prisma from '../database/init.js';
import sitemapFinder from '../helpers/sitemapFinder.js';

const router = express.Router();
// Create a new project
router.post('/projects', async (req, res) => {
    const { name, url, sitemap, userId } = req.body;
    try {
        if (!name || !userId || !url) {
            return res.status(400).json({ message: 'Project name, userId and URL are required.' });
        }
        if(!sitemap) {
            const sitemap = await sitemapFinder.findSitemap(url);
            sitemap=sitemap; // can be null if not found
        }
        const newProject = await prisma.project.create({
            data: { name, url, sitemap, userId}
        });
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }  
});

// Get all projects for a user          
router.get('/users/:userId/projects', async (req, res) => {
    const { userId } = req.params;
    try {
        const projects = await prisma.project.findMany({
            where: { userId: parseInt(userId) }
        });
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }
});

// Get a specific project by ID
router.get('/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) }
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }
});

// Update a project by ID
router.put('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: { name, description }
        });
        res.json(updatedProject);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }
});

// Delete a project by ID
router.delete('/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.project.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Project deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }   
});

export default router;