const request = require("supertest");
const app = require("../src/app"); // Import your Express app
const UserModel = require("../src/models/UserModel");
const OrgModel = require("../src/models/OrgModel");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;

jest.mock("../src/models/UserModel");
jest.mock("../src/models/OrgModel");

describe("Auth Controller", () => {
	describe("POST /auth/register", () => {
		it("should register user successfully with default organisation", async () => {
			const mockUser = {
				userId: "test-user-id",
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "hashedpassword",
				phone: "1234567890",
			};

			const mockOrg = {
				orgId: "test-org-id",
				name: "John's Organization",
			};

			UserModel.prototype.getUser.mockResolvedValue(null);
			UserModel.prototype.createUser.mockResolvedValue(mockUser);
			OrgModel.prototype.createOrg.mockResolvedValue(mockOrg);

			const response = await request(app).post("/auth/register").send({
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "password",
				phone: "1234567890",
			});

			expect(response.status).toBe(201);
			expect(response.body.status).toBe("success");
			expect(response.body.data.user.firstName).toBe("John");
			expect(response.body.data.user.email).toBe("john.doe@example.com");
			expect(response.body.data.accessToken).toBeDefined();
		});

		it("should fail if required fields are missing", async () => {
			const response = await request(app).post("/auth/register").send({
				firstName: "",
				lastName: "",
				email: "",
				password: "",
			});

			expect(response.status).toBe(422);
			expect(response.body.errors).toHaveLength(4);
		});

		it("should fail if email is duplicate", async () => {
			const mockUser = {
				userId: "test-user-id",
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "hashedpassword",
				phone: "1234567890",
			};

			UserModel.prototype.getUser.mockResolvedValue(mockUser);

			const response = await request(app).post("/auth/register").send({
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "password",
				phone: "1234567890",
			});

			expect(response.status).toBe(409);
			expect(response.body.message).toBe("User already exists");
		});
	});

	describe("POST /auth/login", () => {
		it("should log the user in successfully", async () => {
			const mockUser = {
				userId: "test-user-id",
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: await UserModel.prototype.hashPassword("password"),
				phone: "1234567890",
			};

			UserModel.prototype.getUser.mockResolvedValue(mockUser);
			UserModel.prototype.comparePassword.mockResolvedValue(true);

			const response = await request(app).post("/auth/login").send({
				email: "john.doe@example.com",
				password: "password",
			});

			expect(response.status).toBe(200);
			expect(response.body.status).toBe("success");
			expect(response.body.data.user.firstName).toBe("John");
			expect(response.body.data.user.email).toBe("john.doe@example.com");
			expect(response.body.data.accessToken).toBeDefined();
		});

		it("should fail if email is incorrect", async () => {
			UserModel.prototype.getUser.mockResolvedValue(null);

			const response = await request(app).post("/auth/login").send({
				email: "wrong.email@example.com",
				password: "password",
			});

			expect(response.status).toBe(401);
			expect(response.body.message).toBe("Authentication failed.");
		});

		it("should fail if password is incorrect", async () => {
			const mockUser = {
				userId: "test-user-id",
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: await UserModel.prototype.hashPassword("password"),
				phone: "1234567890",
			};

			UserModel.prototype.getUser.mockResolvedValue(mockUser);
			UserModel.prototype.comparePassword.mockResolvedValue(false);

			const response = await request(app).post("/auth/login").send({
				email: "john.doe@example.com",
				password: "wrongpassword",
			});

			expect(response.status).toBe(401);
			expect(response.body.message).toBe("Authentication failed.");
		});
	});
});
