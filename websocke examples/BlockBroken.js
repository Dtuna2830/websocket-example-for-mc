const WebSocket = require('ws');
const uuid = require('uuid');

const port = 19131;
const ipAddress = '127.0.0.1';

console.log(`Ready. In Minecraft chat, type /connect ${ipAddress}:${port}`);
const wss = new WebSocket.Server({ port: port });

var globalSocket;

wss.on('connection', socket => {
  console.log('Connected to Minecraft!');
  globalSocket = socket;

  const subscribeCommand = {
    header: {
      version: 1,
      requestId: uuid.v4(),
      messageType: 'commandRequest',
      messagePurpose: 'subscribe'
    },
    body: {
      eventName: 'BlockBroken'
    }
  };
  globalSocket.send(JSON.stringify(subscribeCommand));

  globalSocket.on('message', (data) => {
    const message = data.toString();
   // console.log('Received:', message);

    const parsedData = JSON.parse(message);
    if (parsedData.header.eventName === 'BlockBroken') {
      const eventData = parsedData.body;
      const playerName = eventData.player.name;
      const blockType = eventData.block.id;
      const coordinates = eventData.player.position;
      console.log(`${playerName} broke a ${blockType} block at coordinates x: ${coordinates.x}, y: ${coordinates.y}, z: ${coordinates.z}.`);
    }
  });
});

wss.on('close', () => {
  console.log('Connection closed');
});

wss.on('error', (error) => {
  console.error('Error:', error);
});
