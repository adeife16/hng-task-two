const request = require("supertest");
const app = require("../src/app"); // Import your Express app
const OrgModel = require("../src/models/OrgModel");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;

jest.mock("../src/models/OrgModel");

describe("Org Controller", () => {
	describe("GET /api/organisations", () => {
		it("should fetch organisations successfully", async () => {
			const token = jwt.sign({ userId: "test-user-id" }, jwtSecret, {
				expiresIn: "1d",
			});

			const mockOrgs = [
				{ orgId: "org1", name: "Org 1" },
				{ orgId: "org2", name: "Org 2" },
			];

			OrgModel.prototype.getUserOrgs.mockResolvedValue(mockOrgs);

			const response = await request(app)
				.get("/api/organisations")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.status).toBe("success");
			expect(response.body.data.organisations.length).toBe(2);
			expect(response.body.data.organisations[0].name).toBe("Org 1");
		});
	});
});
