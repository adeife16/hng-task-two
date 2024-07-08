const UserModel = require("../models/UserModel");
const OrgModel = require("../models/OrgModel");
const UserOrgModel = require("../models/UserOrgModel");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const Joi = require("joi");
const uuid = require("uuid");
const { setToken } = require("../modules/tokenStorage");

class AuthController {
	constructor() {
		this.user = new UserModel();
		this.org = new OrgModel();
		this.userOrg = new UserOrgModel();
	}
	async login(req, res) {
		const { email, password } = req.body;

		// Validate user input
		const schema = Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().required(),
		});
		const { error } = schema.validate(req.body);
		if (error) {
			return res.status(401).json({
				status: "Bad Request",
				field: error.details[0].path[0],
				message: error.details[0].message,
			});
		}

		const user = await this.user.getUser({ email });
		if (!user) {
			return res.status(401).json({
				status: "Bad Request",
				message: "Authentication failed.",
			});
		}

		const passwordMatch = await this.user.comparePassword(
			password,
			user.password
		);
		if (!passwordMatch) {
			return res.status(401).json({
				status: "Bad Request",
				message: "Authentication failed.",
			});
		}

		const prevToken = req.headers["authorization"]?.split(" ")[1];
		if (prevToken) {
			blacklistToken(prevToken);
		}

		const token = jwt.sign({ userId: user.userId }, jwtSecret, {
			expiresIn: "1d",
		});

		setToken(user.userId, token);

		res.status(200).json({
			status: "success",
			message: "Login successful",
			data: {
				accessToken: token,
				user: {
					userId: user.userId,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					phone: user.phone,
				},
			},
		});
	}

	async signup(req, res) {
		const { firstName, lastName, email, password, phone } = req.body;

		// Validate user input
		const schema = Joi.object({
			firstName: Joi.string().required().messages({
				"any.required": "First name is required",
				"string.base": "First name must be a string",
			}),

			lastName: Joi.string().required().messages({
				"any.required": "Last name is required",
				"string.base": "Last name must be a string",
			}),

			email: Joi.string().email().required().messages({
				"any.required": "Email is required",
				"string.base": "Email must be a string",
				"string.email": "Email must be a valid email",
			}),

			password: Joi.string().required().min(8).messages({
				"any.required": "Password is required",
				"string.base": "Password must be a string",
				"string.min": "Password must be at least 8 characters long",
			}),
			phone: Joi.number().messages({
				"number.base": "Phone must be a number",
			}),
		});

		const { error } = schema.validate(req.body, { abortEarly: false });
		if (error) {
			// Format the error messages
			const errorMessages = error.details.map((detail) => ({
				field: detail.context.key,
				message: detail.message,
			}));
			return res.status(422).json({ errors: errorMessages });
		}

		// Check if user already exists
		const check = await this.user.getUser({ email });
		if (check) {
			return res.status(409).json({ message: "User already exists" });
		}

		// Hash password
		const hashedPassword = await this.user.hashPassword(password);

		// Create user
		const userId = uuid.v4();
		const user = await this.user.createUser({
			userId,
			firstName,
			lastName,
			email,
			password: hashedPassword,
			phone,
		});

		if (!user) {
			return res
				.status(400)
				.json({ message: "Registration unsuccessful" });
		}

		// Create org
		const org = await this.org.createOrg({
			orgId: uuid.v4(),
			name: `${firstName}'s Organization`,
		});

		if (!org) {
			return res
				.status(400)
				.json({ message: "Registration unsuccessful" });
		}

		// Add user to org
		await this.userOrg.addUserToOrg(user.userId, org.orgId);

		res.status(201).json({
			status: "success",
			message: "Registration successful.",
			data: {
				accessToken: jwt.sign({ userId: user.userId }, jwtSecret, {
					expiresIn: "1d",
				}),
				user: {
					userId: user.userId,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					phone: user.phone,
				},
			},
		});
	}
}

module.exports = AuthController;
