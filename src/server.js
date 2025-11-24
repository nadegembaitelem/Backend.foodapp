const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ==== Import des routes ====
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const menusRoutes = require('./routes/menus');
const adminRoutes = require('./routes/admin');

// ==== Sequelize ====
const sequelize = require('./db');
const { User, Restaurant, Menu, Order } = require('./models');
const bcrypt = require('bcrypt');

const app = express();

// ==== Middlewares ====
app.use(cors());
app.use(express.json());

// ==== Content-Security-Policy ====
app.use((req, res, next) => {
const csp = [
"default-src 'self' https:",
"connect-src *",
"img-src 'self' https: data: blob:",
"script-src 'self' 'unsafe-inline'",
"style-src 'self' 'unsafe-inline'",
"font-src 'self' https: data:"
].join('; ');
res.setHeader('Content-Security-Policy', csp);
next();
});

// ==== Dossier uploads ====
const uploadsPath = path.join(__dirname, '..', 'uploads');
const publicPath = path.join(__dirname, '..', 'public');
app.use('/', express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));

const uploadDir = path.join(uploadsPath, 'menus');
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
console.log("✅ Dossier uploads/menus créé");
}

// ==== Favicon ====
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
if (fs.existsSync(faviconPath)) {
app.use('/favicon.ico', express.static(faviconPath));
}

// ==== Routes ====
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/admin', adminRoutes);

// ==== Route test ====
app.get('/test', (req, res) => res.json({ message: '✅ Backend FoodApp fonctionne!' }));

// ==== Health Check ====
app.get('/health', async (req, res) => {
try {
await sequelize.authenticate();
return res.json({ ok: true, db: true });
} catch (err) {
console.error('[HEALTH] DB check failed:', err);
return res.status(500).json({ ok: false, db: false, error: err.message });
}
});

// ==== SOCKET.IO ====
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
console.log('🟢 Client connecté:', socket.id);
socket.on('disconnect', () => {
console.log('🔴 Client déconnecté:', socket.id);
});
});
app.set('socketio', io);

// ==== Synchronisation Sequelize et création admin ====
(async () => {
await sequelize.sync();
console.log('✅ Tables synchronisées');

const adminEmail = 'admin@example.com';
const adminPassword = 'MotDePasseAdmin123';

const exist = await User.findOne({ where: { email: adminEmail } });
if (!exist) {
const hashed = await bcrypt.hash(adminPassword, 10);
await User.create({
name: 'Super Admin',
email: adminEmail,
password: adminPassword,
role: 'admin'
});
console.log('✅ ADMIN CRÉÉ AVEC SUCCÈS SUR RENDER');
} else {
console.log('ℹ️ Admin déjà existant');
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
console.log(`🚀 Serveur + WebSocket lancé sur le port ${PORT}`);
});
})();
