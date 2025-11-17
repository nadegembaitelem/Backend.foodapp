require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const menusRoutes = require("./routes/menus");

const app = express();

// ===== Middlewares =====
app.use(cors()); // Autorise toutes les requêtes cross-origin
app.use(express.json()); // Parse JSON body

// ===== CSP adapté =====
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src *; img-src * data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self';"
  );
  next();
});

// ===== Gestion des uploads =====
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const menusDir = path.join(uploadsDir, 'menus');
if (!fs.existsSync(menusDir)) fs.mkdirSync(menusDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));

// Favicon
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// ===== Routes API =====
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menus', menusRoutes);

// Route de test rapide
app.get('/test', (req, res) => res.json({ message: '✅ Backend FoodApp fonctionne!' }));

// ===== SOCKET.IO =====
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connecté:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté:", socket.id);
  });
});

// Rendre Socket.IO accessible dans les routes
app.set("socketio", io);

// ===== Démarrage serveur =====
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur + WebSocket lancé sur le port ${PORT}`);
});
