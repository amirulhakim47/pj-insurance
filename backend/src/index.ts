import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { tokenManager } from './services/allianz-auth';
import { errorHandler } from './middleware/error-handler';
import { generalLimiter, quoteLimiter, submissionLimiter } from './middleware/rate-limiter';
import vehicleRoutes from './routes/vehicle';
import ubbRoutes from './routes/ubb';
import quoteRoutes from './routes/quote';
import submissionRoutes from './routes/submission';
import lovRoutes from './routes/lov';
import callbackRoutes from './routes/callback';
import paymentRoutes from './routes/payment';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());
app.disable('x-powered-by');

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));

app.use(generalLimiter);

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} [${req.ip}]`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    allianzConfigured: tokenManager.isConfigured(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', vehicleRoutes);
app.use('/api', ubbRoutes);
app.use('/api', quoteLimiter, quoteRoutes);
app.use('/api', submissionLimiter, submissionRoutes);
app.use('/api', lovRoutes);
app.use('/api', callbackRoutes);
app.use('/api', paymentRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n[Server] Backend running on http://localhost:${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `[Server] Allianz credentials: ${tokenManager.isConfigured() ? 'configured' : 'NOT configured - set ALLIANZ_CONSUMER_KEY and ALLIANZ_CONSUMER_SECRET'}`,
  );
  console.log(
    `[Server] CORS origins: ${allowedOrigins.join(', ')}\n`,
  );
});

export default app;
