import express from 'express';
import {
    createProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject
} from '../controllers/Project.controller.js';
import {authenticateToken} from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); 

router.post('/projects', createProject);
router.get('/users/:userId/projects', getUserProjects);
router.get('/projects/:id', getProjectById);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

export default router;