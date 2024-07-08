const UserModel = require("../models/UserModel");
const OrgModel = require("../models/OrgModel");
const UserOrgModel = require("../models/UserOrgModel");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const Joi = require("joi");
const uuid = require("uuid");
const { setToken } = require("../modules/tokenStorage");

class OrgController {
	constructor() {
		this.user = new UserModel();
		this.org = new OrgModel();
		this.userOrg = new UserOrgModel();
	}

	async getUserOrgs(req, res) {
		const token = req.headers.authorization?.split(" ")[1] || null;

		const decoded = jwt.verify(token, jwtSecret);
		const userId = decoded.userId;
		const userOrgs = await this.org.getUserOrgs({ userId });

		const orgData = [];
		for (let i = 0; i < userOrgs.length; i++) {
			const org = await this.org.getOrg({ orgId: userOrgs[i].orgId });
			orgData.push(org);
		}

		return res.status(200).json({
			status: "success",
			message: "Data fetched successfully",
			data: {
				organisations: orgData,
			},
		});
	}

	async getUserOrg(req, res) {
		const token = req.headers.authorization?.split(" ")[1] || null;
		const orgId = req.params.orgId;

		const decoded = jwt.verify(token, jwtSecret);
		const userId = decoded.userId;
		const userOrg = await this.org.getUserOrg({ userId, orgId });
		if (!userOrg) {
			return res.status(404).json({ message: "User not found" });
		}
		const org = await this.org.getOrg({ orgId });
		if (!org) {
			return res.status(404).json({ message: "Org not found" });
		}
		return res.status(200).json({
			status: "success",
			message: "Data fetched successfully",
			data: org,
		});
	}

	async createOrg(req, res) {
		const token = req.headers.authorization?.split(" ")[1] || null;
		const decoded = jwt.verify(token, jwtSecret);
		const userId = decoded.userId;

		const { name, description } = req.body;

		// Validate user input
		const schema = Joi.object({
			name: Joi.string().required().messages({
				"any.required": "Name is required",
				"string.base": "Name must be a string",
			}),
			description: Joi.string().required().messages({
				"any.required": "Description is required",
				"string.base": "Description must be a string",
			}),
		});
		const { error } = schema.validate(req.body);
		if (error) {
			return res.status(400).json({
				status: "Bad Request",
				field: error.details[0].path[0],
				message: error.details[0].message,
			});
		}

		// Create org
		const orgId = uuid.v4();
		const org = await this.org.createOrg({
			orgId: orgId,
			name: name,
			description: description
		});

        if (!org) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Failed to create organisation",
            });
        }

		await this.userOrg.addUserToOrg( userId, orgId );

		return res.status(201).json({
			status: "success",
			message: "Organisation created successfully",
			data: org,
		});
	}

    async addUserToOrg(req, res) {
        const token = req.headers.authorization?.split(" ")[1] || null;
        const decoded = jwt.verify(token, jwtSecret);
        const ownerId = decoded.userId;

        const { userId } = req.body;
        
        const orgId = req.params.orgId;

        const register = await this.userOrg.addUserToOrg( userId, orgId );
        if (!register) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Failed to add user to organisation",
            });
        }
        return res.status(201).json({
            status: "success",
            message: "User added to organisation successfully",
        });
    }
}

module.exports = OrgController;
