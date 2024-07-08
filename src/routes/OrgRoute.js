const express = require("express");
const orgRoute = express.Router();
const OrgController = require("../controllers/OrgController")
const authMiddleware = require("../Middleware/AuthMiddleware");

const orgController = new OrgController();
const getUserOrgsHandler = orgController.getUserOrgs.bind(orgController);
const getUserOrgHandler = orgController.getUserOrg.bind(orgController);
const createOrgHandler = orgController.createOrg.bind(orgController);
const addUserToOrgHandler = orgController.addUserToOrg.bind(orgController);

orgRoute.get("/organisations", authMiddleware, getUserOrgsHandler);
orgRoute.get("/organisations/:orgId", authMiddleware, getUserOrgHandler);
orgRoute.post("/organisations", authMiddleware, createOrgHandler);
orgRoute.post("/organisations/:orgId/users", authMiddleware, addUserToOrgHandler);

module.exports = orgRoute;