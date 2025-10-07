import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import prisma from '../database/init.js';

const bcrypt = bcryptjs;
const jwt = jsonwebtoken;

/**
 * Registers a new user.
 *
 * Validates the request body for email and password, checks if the user already exists,
 * hashes the password, and creates a new user in the database.
 *
 * @async
 * @function register
 * @param {import('express').Request} req - Express request object containing user email and password in the body.
 * @param {import('express').Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Responds with a success message if registration is successful,
 * or an error message if registration fails.
 */
export const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required.' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.create({
            data: { email, password: hashedPassword, createdAt: new Date() }
        });

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error.' });
    }
};

/**
 * Authenticates a user and returns a JWT token.
 *
 * Validates the request body for email and password, checks if the user exists,
 * compares the provided password with the stored hashed password, and returns a JWT token if authentication is successful.
 *
 * @async
 * @function login
 * @param {import('express').Request} req - Express request object containing user email and password in the body.
 * @param {import('express').Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Responds with a JWT token if authentication is successful,
 * or an error message if authentication fails.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required.' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign(
            { email: user.email, id: user.id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};