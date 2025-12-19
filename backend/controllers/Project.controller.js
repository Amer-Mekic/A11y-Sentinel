import prisma from '../database/init.js';
import sitemapFinder from '../helpers/sitemapFinder.js';


/**
 * Creates a new project for a user.
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing project details in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const createProject = async (req, res) => {
    const { name, url, sitemap} = req.body;
    const user = req.user.id;
    try {
        if (!name || !url) {
            return res.status(400).json({ message: 'Project name and URL are required.' });
        }
        let finalSitemap = sitemap;
        if (!finalSitemap) {
            finalSitemap = await sitemapFinder.findSitemap(url);
            // can be null if not found
        }
        const newProject = await prisma.project.create({
            data: { name, url, sitemap: finalSitemap, userId: user}
        });
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }  
};

/**
 * Retrieves all projects for a specific user.
 * @async
 * @function
 * @param {import('express').Request} req - Express request object with userId in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const getUserProjects = async (req, res) => {
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
};

/**
 * Retrieves a specific project by its ID.
 * @async
 * @function
 * @param {import('express').Request} req - Express request object with project id in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const getProjectById = async (req, res) => {
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
};

/**
 * Updates a project by its ID.
 * @async
 * @function
 * @param {import('express').Request} req - Express request object with project id in params and updated data in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const updateProject = async (req, res) => {
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
};

/**
 * Deletes a project by its ID.
 * @async
 * @function
 * @param {import('express').Request} req - Express request object with project id in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.project.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Project deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }   
};