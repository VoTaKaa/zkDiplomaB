const express = require("express");
const {
  createIssuerController,
  loginController,
} = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/create-issuer", createIssuerController);
router.post("/login", loginController);

module.exports = router;
