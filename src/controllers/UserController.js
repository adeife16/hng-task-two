const UserModel = require("../models/UserModel");
const OrgModel = require("../models/OrgModel");
const UserOrgModel = require("../models/UserOrgModel");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const Joi = require("joi");

class UserController {
	constructor() {
		this.user = new UserModel();
		this.org = new OrgModel();
		this.userOrg = new UserOrgModel();
	}
	async getUser(req, res) {
		const { id } = req.params;
		const user = await this.user.getUser({ userId: id });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		delete user.password;
		return res.status(200).json({
			status: "success",
			message: "User fetched successfully",
			data: user,
		});
	}
}

module.exports = UserController;
