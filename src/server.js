require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const OrderRoutes = require('./routes/orders');
const menusRoutes = require("./routes/menus");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src *; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

// Dossier uploads
app.use("/uploads", express.static(path.join(__dirname, '..', 'uploads')));
const uploadDir = path.join(__dirname, '..', 'uploads', 'menus');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/menus', menusRoutes);

app.get('/test', (req, res) => res.json({ message: 'Backend OK!' }));

// SOCKET.io
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000; // IMPORTANT POUR RENDER

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connecté:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté:", socket.id);
  });
});

app.set("socketio", io);

// Start
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur + WebSocket lancé sur le port ${PORT}`);
});
