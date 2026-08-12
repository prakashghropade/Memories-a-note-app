const client = require('prom-client');

// Collect default Node.js metrics
client.collectDefaultMetrics({
    prefix: 'memories_app_'
});

// Total HTTP requests
const httpRequestsTotal = new client.Counter({
    name: 'memories_app_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// HTTP request duration
const httpRequestDuration = new client.Histogram({
    name: 'memories_app_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

// Currently active requests
const httpRequestsInProgress = new client.Gauge({
    name: 'memories_app_http_requests_in_progress',
    help: 'Number of HTTP requests currently being processed'
});

module.exports = {
    client,
    httpRequestsTotal,
    httpRequestDuration,
    httpRequestsInProgress
};