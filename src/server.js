require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const menusRoutes = require("./routes/menus");
const adminRoutes = require('./routes/admin');


// Import sequelize instance pour health-check DB
const sequelize = require("../db");

const app = express();
const { User } = require("./models");
const bcrypt = require("bcrypt");

// Création admin auto si n'existe pas
(async () => {
  const adminEmail = "admin@example.com";
  const adminPassword = "MotDePasseAdmin123";

  const exist = await User.findOne({ where: { email: adminEmail } });
  if (!exist) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashed,
      role: "admin"
    });
    console.log("✅ ADMIN CRÉÉ AVEC SUCCÈS SUR RENDER");
  } else {
    console.log("ℹ️ Admin déjà existant");
  }
})();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Content-Security-Policy (CSP) =====
// On autorise ici les ressources depuis self et tout hôte HTTPS pour les images
// (utile pour déploiement sur Render et pour les URLs d'assets renvoyées par le backend).
app.use((req, res, next) => {
  // Par sécurité, on limite les scripts/styles à 'self' mais autorise les images depuis HTTPS et data: URIs
  const csp = [
    "default-src 'self' https:",
    "connect-src *",
    "img-src 'self' https: data: blob:",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' https: data:",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
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
app.use('/api/admin', adminRoutes);

// ===== Route de test =====
app.get('/test', (req, res) => res.json({ message: '✅ Backend FoodApp fonctionne!' }));

// ===== Health check =====
// Renvoie l'état du service et vérifie la connexion à la DB
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, db: true });
  } catch (err) {
    console.error('[HEALTH] DB check failed:', err && err.stack ? err.stack : err);
    return res.status(500).json({ ok: false, db: false, error: err?.message || String(err) });
  }
});

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
