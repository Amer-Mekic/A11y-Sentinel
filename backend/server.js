import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/Auth.routes.js';
import projectRoutes from './routes/Project.routes.js';
import scanRoutes from './routes/Scan.routes.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mounting auth & project routes
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/scan', scanRoutes);

app.get('/', (_, res) => {
    res.send('API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});