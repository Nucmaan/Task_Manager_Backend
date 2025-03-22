require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());
app.use(express.json());

const services = {
  user: 'http://localhost:8001',
  project: 'http://localhost:8002',
  task: 'http://localhost:8003',
};

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});


app.use('/api/project', createProxyMiddleware({
  target: services.project,
  changeOrigin: true,
  logLevel: 'debug', 
  onProxyReq: (proxyReq, req) => {
    console.log(`[Proxy] Redirecting ${req.originalUrl} -> ${services.project}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Proxy] Response received from ${services.project}${req.url} - Status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[Proxy Error] Failed to reach ${services.project}${req.url} - ${err.message}`);
    res.status(500).json({ error: 'Proxy Error', details: err.message });
  }
}));

// Root endpoint
app.get('/', (req, res) => {
  res.send('🚀 API Gateway is Running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start API Gateway
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
