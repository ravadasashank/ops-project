const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ── Custom Metrics ────────────────────────────────────────────────────────────
const httpRequestTotal = new client.Counter({
  name: 'meditrack_http_requests_total',
  help: 'Total HTTP requests to MediTrack API',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpDuration = new client.Histogram({
  name: 'meditrack_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
  registers: [register],
});

const activePatients = new client.Gauge({
  name: 'meditrack_active_patients_total',
  help: 'Total number of active patients in system',
  registers: [register],
});

const criticalPatients = new client.Gauge({
  name: 'meditrack_critical_patients_total',
  help: 'Number of patients in critical condition',
  registers: [register],
});

// Middleware to track HTTP requests
function metricsMiddleware(req, res, next) {
  const end = httpDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    httpRequestTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
    end();
  });
  next();
}

module.exports = metricsMiddleware;
module.exports.register        = register;
module.exports.activePatients  = activePatients;
module.exports.criticalPatients = criticalPatients;
