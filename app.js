const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http,{
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
// Store connected clients and their rooms
let connectedClients = {};


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle client joining a room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        connectedClients[socket.id] = roomId;

        // Broadcast a message to all clients in the room except the sender
        socket.broadcast.to(roomId).emit('userJoined', socket.id);
    });

    // Handle receiving ICE candidates from a client
    socket.on('iceCandidate', (candidate) => {
        io.to(connectedClients[candidate.target]).emit('iceCandidate', candidate);
    });

    // Handle receiving an offer from a client
    socket.on('offer', (offer) => {
        io.to(connectedClients[offer.target]).emit('offer', offer);
    });

    // Handle receiving an answer from a client
    socket.on('answer', (answer) => {
        io.to(connectedClients[answer.target]).emit('answer', answer);
    });

    // Handle a client disconnecting
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Remove client from connectedClients and notify other clients in the room
        const roomId = connectedClients[socket.id];
        if (roomId) {
            socket.broadcast.to(roomId).emit('userLeft', socket.id);
            delete connectedClients[socket.id];
        }
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
