const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/solutions', require('./routes/solutions'));

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => socket.join(roomId));
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });
  socket.on('disconnect', () => {});
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error('DB Error:', err));

module.exports = { io };