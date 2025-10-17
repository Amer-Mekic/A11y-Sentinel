import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/Auth.routes.js';
import projectRoutes from './routes/Project.routes.js';
import scanRoutes from './routes/Scan.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mounting auth & project routes
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/scan', scanRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});