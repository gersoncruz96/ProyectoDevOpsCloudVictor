const express = require('express');
const os = require('os');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  registers: [register]
});

// Middleware para métricas
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route: req.path }, duration);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint para Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: {
      total: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
      free: Math.round(os.freemem() / 1024 / 1024) + ' MB'
    },
    uptime: Math.round(os.uptime()) + ' seconds',
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'development'
  });
});

// Dashboard principal
app.get('/', (req, res) => {
  const uptime = Math.round(os.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevOps Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #e0e0e0;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      text-align: center;
      margin-bottom: 3rem;
    }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    .subtitle { color: #8892b0; font-size: 1.1rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: #4285F4;
    }
    .card-icon { font-size: 2rem; margin-bottom: 0.8rem; }
    .card-title { font-size: 0.85rem; color: #8892b0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem; }
    .card-value { font-size: 1.4rem; font-weight: 700; color: #ccd6f6; }
    .status-bar {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(52, 168, 83, 0.3);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .status-dot {
      width: 12px; height: 12px;
      background: #34A853;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      justify-content: center;
      margin-top: 2rem;
    }
    .tech-badge {
      background: rgba(66, 133, 244, 0.15);
      border: 1px solid rgba(66, 133, 244, 0.3);
      border-radius: 20px;
      padding: 0.4rem 1rem;
      font-size: 0.8rem;
      color: #4285F4;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin: 2rem 0;
    }
    .btn {
      padding: 0.7rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: #fff;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .btn-blue { background: linear-gradient(135deg, #4285F4, #1a73e8); }
    .btn-green { background: linear-gradient(135deg, #34A853, #1e8e3e); }
    .btn-orange { background: linear-gradient(135deg, #F46800, #e65100); }
    .btn-red { background: linear-gradient(135deg, #EA4335, #c62828); }
    .btn-purple { background: linear-gradient(135deg, #7B42BC, #5E35B1); }
    .response-box {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1rem;
      margin-top: 1rem;
      font-family: monospace;
      font-size: 0.85rem;
      max-height: 200px;
      overflow-y: auto;
      display: none;
    }
    .section-title {
      font-size: 1.2rem;
      color: #ccd6f6;
      margin: 2rem 0 1rem;
      text-align: center;
      font-weight: 600;
    }
    footer { text-align: center; margin-top: 3rem; color: #5a6070; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>DevOps Dashboard</h1>
      <p class="subtitle">Proyecto Final - Sistemas Operativos II</p>
    </header>

    <div class="status-bar">
      <div class="status-dot"></div>
      <span><strong>Status:</strong> All systems operational</span>
      <span style="margin-left:auto;color:#8892b0;">Pod: ${os.hostname()}</span>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-icon">&#x1F5A5;</div>
        <div class="card-title">Hostname</div>
        <div class="card-value">${os.hostname()}</div>
      </div>
      <div class="card">
        <div class="card-icon">&#x23F1;</div>
        <div class="card-title">Uptime</div>
        <div class="card-value">${hours}h ${minutes}m</div>
      </div>
      <div class="card">
        <div class="card-icon">&#x1F4BB;</div>
        <div class="card-title">Platform</div>
        <div class="card-value">${os.platform()} (${os.arch()})</div>
      </div>
      <div class="card">
        <div class="card-icon">&#x2699;</div>
        <div class="card-title">CPUs</div>
        <div class="card-value">${os.cpus().length} cores</div>
      </div>
      <div class="card">
        <div class="card-icon">&#x1F4BE;</div>
        <div class="card-title">Memory</div>
        <div class="card-value">${Math.round(os.freemem()/1024/1024)} / ${Math.round(os.totalmem()/1024/1024)} MB</div>
      </div>
      <div class="card">
        <div class="card-icon">&#x1F4E6;</div>
        <div class="card-title">Node.js</div>
        <div class="card-value">${process.version}</div>
      </div>
    </div>

    <div class="tech-stack">
      <span class="tech-badge">Google Cloud</span>
      <span class="tech-badge">Kubernetes (GKE)</span>
      <span class="tech-badge">Docker</span>
      <span class="tech-badge">Terraform</span>
      <span class="tech-badge">GitHub Actions</span>
      <span class="tech-badge">Prometheus</span>
      <span class="tech-badge">Grafana</span>
      <span class="tech-badge">Node.js</span>
    </div>

    <p class="section-title">Acciones</p>
    <div class="actions">
      <button class="btn btn-blue" onclick="fetchData('/api/info')">System Info</button>
      <button class="btn btn-green" onclick="fetchData('/health')">Health Check</button>
      <button class="btn btn-orange" onclick="window.open('http://136.115.122.75:9090','_blank')">Prometheus</button>
      <button class="btn btn-red" onclick="window.open('http://35.202.123.208:3000','_blank')">Grafana</button>
      <button class="btn btn-purple" onclick="fetchData('/metrics')">Metrics</button>
    </div>
    <div class="response-box" id="response"></div>

    <div class="tech-stack">
      <span class="tech-badge">Google Cloud</span>
      <span class="tech-badge">Kubernetes (GKE)</span>
      <span class="tech-badge">Docker</span>
      <span class="tech-badge">Terraform</span>
      <span class="tech-badge">GitHub Actions</span>
      <span class="tech-badge">Prometheus</span>
      <span class="tech-badge">Grafana</span>
      <span class="tech-badge">Node.js</span>
    </div>

    <script>
      async function fetchData(endpoint) {
        const box = document.getElementById('response');
        box.style.display = 'block';
        box.textContent = 'Loading...';
        try {
          const res = await fetch(endpoint);
          const text = await res.text();
          try {
            const json = JSON.parse(text);
            box.textContent = JSON.stringify(json, null, 2);
          } catch {
            box.textContent = text.substring(0, 500) + '...';
          }
        } catch (err) {
          box.textContent = 'Error: ' + err.message;
        }
      }
    </script>

    <footer>
      <p>Infraestructura DevOps en la Nube | GKE + Terraform + CI/CD</p>
    </footer>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
});
