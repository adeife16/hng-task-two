const express = require("express");
const userRoute = express.Router();
const UserController = require("../controllers/UserController");

const userController = new UserController();
const getUserHandler = userController.getUser.bind(userController);

const authMiddleware = require("../Middleware/AuthMiddleware");


userRoute.get("/:id", authMiddleware, getUserHandler);

module.exports = userRoute;