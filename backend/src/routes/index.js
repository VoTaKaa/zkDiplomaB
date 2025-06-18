const authRoutes = require("./auth.route.js");
const issuerRoutes = require("./issuer.route.js");
const holderRoutes = require("./holder.route.js");
const verifierRoutes = require("./verifier.route.js");

const routes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/issuer", issuerRoutes);
  app.use("/api/holder", holderRoutes);
  app.use("/api/verifier", verifierRoutes);
};

module.exports = routes;
