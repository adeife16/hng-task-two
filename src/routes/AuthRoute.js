const express = require("express");
const authRoute = express.Router();

const AuthController = require("../controllers/AuthController");

const authController = new AuthController();

const loginHandler = authController.login.bind(authController);
const signupHandler = authController.signup.bind(authController);

authRoute.post("/login", loginHandler);
authRoute.post("/register", signupHandler);

module.exports = authRoute;