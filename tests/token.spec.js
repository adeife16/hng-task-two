const { setToken, getToken } = require("../src/modules/tokenStorage");

describe("Token Storage", () => {
	it("should store and retrieve token correctly", () => {
		const userId = "test-user-id";
		const token = "test-token";

		setToken(userId, token);
		const retrievedToken = getToken(userId);

		expect(retrievedToken).toBe(token);
	});
});
