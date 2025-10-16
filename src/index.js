// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import projectRoutes from './routes/projectRoutes.js';
import projectMemberRoutes from './routes/projectMemberRoutes.js';
import boardsRoutes from './routes/boardsRoutes.js';
import columnsRoutes from './routes/columnsRoutes.js';
import cardsRoutes from './routes/cardsRoutes.js';
import { clerkIdInjectorWithLogging, performanceLogger } from './middleware/index.js';

const app = express();
const PORT = process.env.PORT || 3002;

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Clerk Middleware (auth)
try {
  app.use(clerkMiddleware());
  console.log('Clerk middleware aktif');
} catch (err) {
  console.warn('Clerk middleware gagal di-load (dev mode):', err.message);
}

// Middleware custom
app.use(clerkIdInjectorWithLogging);  // inject Clerk ID (dari body/header/auth)
app.use(performanceLogger);           // log durasi request

// ===============================
// Health check
// ===============================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ===============================
// API Routes
// Prefix semua routes dengan /api
// ===============================
app.use('/api/projects', projectRoutes);
app.use('/api/project-members', projectMemberRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/columns', columnsRoutes);
app.use('/api/cards', cardsRoutes);

// ===============================
// Error Handling
// ===============================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===============================
// Server start
// ===============================
export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
