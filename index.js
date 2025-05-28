const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = 8080;
const WS_PORT = 8081;

app.use(cors());
app.use(express.json());

let clients = [];

const wss = new WebSocket.Server({ port: WS_PORT });
wss.on('connection', ws => {
  clients.push(ws);
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

app.post('/location', (req, res) => {
  const data = JSON.stringify(req.body);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
});
