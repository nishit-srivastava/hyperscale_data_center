// Simple mock telemetry server
const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const port = 8081;

app.use(express.json());

app.get('/mock-server/snapshot', (req, res) => {
  res.json({
    time: new Date().toISOString(),
    PUE: 1.28,
    totalPower_kW: 1240,
    CO2_kg_per_month: 3200
  });
});

const server = app.listen(port, () => {
  console.log('Mock server listening on http://localhost:' + port);
});

const wss = new WebSocketServer({ server });

function randomTelemetry() {
  return {
    time: new Date().toISOString(),
    rack: 'Rack-' + (Math.floor(Math.random()*20)+1),
    Power_kW: Math.round(50 + Math.random()*300),
    PUE: +(1.0 + Math.random()*0.6).toFixed(2),
    CO2: Math.round(50 + Math.random()*200)
  };
}

wss.on('connection', (ws) => {
  console.log('ws client connected');
  const iv = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(randomTelemetry()));
    }
  }, 1500);

  ws.on('close', () => {
    clearInterval(iv);
    console.log('ws client disconnected');
  });
});
