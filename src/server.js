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
app.use(cors());
app.use(express.json());

// ===== CSP (Content-Security-Policy) =====
// Autorise :
// - default-src 'self' → tout ce qui n’est pas précisé vient de ton serveur
// - connect-src * → toutes les requêtes XHR/Fetch/WebSocket
// - img-src 'self' data: → images locales + base64
// - style-src 'self' 'unsafe-inline' → styles inline
// - script-src 'self' → scripts locaux uniquement
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src *; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

// ===== Dossier uploads =====
const uploadsDir = path.join(__dirname, '..', 'uploads');
const menusDir = path.join(uploadsDir, 'menus');

// Crée les dossiers si nécessaire
if (!fs.existsSync(menusDir)) {
  fs.mkdirSync(menusDir, { recursive: true });
  console.log("✅ Dossier uploads/menus créé");
}

// Sert les fichiers statiques des uploads
app.use("/uploads", express.static(uploadsDir));

// ===== Favicon =====
// Place ton favicon dans ./public/favicon.ico
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menus', menusRoutes);

// Route de test
app.get('/test', (req, res) => res.json({ message: '✅ Backend FoodApp fonctionne!' }));

// ===== SOCKET.IO =====
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;

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

// Permet d'utiliser io dans les routes
app.set("socketio", io);

// ===== Démarrage serveur =====
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur + WebSocket lancé sur le port ${PORT}`);
});
