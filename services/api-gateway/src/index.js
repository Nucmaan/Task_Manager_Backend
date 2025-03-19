require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const services = {
  user: 'http://localhost:8001',
  project: 'http://localhost:8002',
  task: 'http://localhost:8003',
};

 app.use('/api/auth', createProxyMiddleware({ target: services.user, changeOrigin: true }));  
app.use('/api/project', createProxyMiddleware({ target: services.project, changeOrigin: true }));
app.use('/api/task', createProxyMiddleware({ target: services.task, changeOrigin: true })); 
app.use('/api/task-assignment', createProxyMiddleware({ target: services.task, changeOrigin: true }));

app.get('/', (req, res) => {
  res.send('API Gateway is Running...');
});

const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
