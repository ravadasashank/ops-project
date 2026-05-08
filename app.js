const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const metricsMiddleware = require('./middleware/metrics');
const patientRoutes     = require('./routes/patients');
const vitalRoutes       = require('./routes/vitals');
const healthRoutes      = require('./routes/health');
const metricsRoutes     = require('./routes/metrics');

const app = express();

// ── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// ── Prometheus Request Tracking ──────────────────────────────────────────────
app.use(metricsMiddleware);

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/patients', patientRoutes);
app.use('/api/vitals',   vitalRoutes);
app.use('/api/health',   healthRoutes);
app.use('/metrics',      metricsRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
