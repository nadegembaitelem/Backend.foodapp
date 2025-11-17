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

// ===== Content-Security-Policy (CSP) =====
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    // default-src autorise ton domaine + self
    "default-src 'self' https://backend-foodapp.onrender.com; " +
    "connect-src *; " +
    "img-src 'self' https://backend-foodapp.onrender.com data:; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self';"
  );
  next();
});

// ===== Dossier uploads =====
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use("/uploads", express.static(uploadsPath));

// Crée le dossier menus si nécessaire
const uploadDir = path.join(uploadsPath, 'menus');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Dossier uploads/menus créé");
}

// ===== Favicon =====
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
if (fs.existsSync(faviconPath)) {
  app.use('/favicon.ico', express.static(faviconPath));
}

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menus', menusRoutes);

// ===== Route de test =====
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

// Permet d'utiliser io dans les routes
app.set("socketio", io);

// ===== Démarrage serveur =====
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur + WebSocket lancé sur le port ${PORT}`);
});
