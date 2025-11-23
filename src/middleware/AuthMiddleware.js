const jwt = require("jsonwebtoken");

// 🔹 Vérifie que le token est valide
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token requis" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide ou expiré" });
    }
    req.user = user; // contient userId, email, role, etc.
    next();
  });
};

// 🔹 Vérifie si le rôle de l'utilisateur est autorisé à accéder à la route
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé : rôle non autorisé" });
    }
    next();
  };
};
// router.use(authenticateToken, authorizeRoles("admin"));


module.exports = { authenticateToken, authorizeRoles };
