import express from 'express';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import prisma from '../database/init.js';

const bcrypt = bcryptjs;
const jwt = jsonwebtoken;
const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!password || !email) {
            throw { status: 400, message: 'Email and password required.' };
        }

        const existingUser = prisma.user.findUnique({where: {email:email}});
        if (existingUser) {
            throw { status: 409, message: 'User already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        prisma.user.create({data: {email:email, password:hashedPassword, createdAt: new Date()}});

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required.' });

        const user = await prisma.user.findUnique({where: {email:email}});
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;