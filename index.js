const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Explicitly allow WebSocket upgrade
const wss = new WebSocket.Server({ noServer: true });

let clients = [];

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', ws => {
  clients.push(ws);
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

app.use(cors());
app.use(express.json());

app.post('/location', (req, res) => {
  const data = JSON.stringify(req.body);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`HTTP & WebSocket server running on port ${PORT}`);
});
// trigger redeploy
