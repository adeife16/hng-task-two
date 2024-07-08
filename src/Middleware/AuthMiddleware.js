const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const { getToken } = require("../modules/tokenStorage");

const authMiddleware = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1] || null;

	if (!token) {
		return res.status(401).json({ message: "No token provided." });
	}

	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err) {
			return res
				.status(403)
				.json({ message: "Invalid or expired token." });
		}

		// Extract userId from the decoded token
		const userId = decoded.userId;

		// Check if the token is the latest token
		const latestToken = getToken(userId);
		if (latestToken !== token) {
			return res
				.status(401)
				.json({ message: "Invalid or expired token." });
		}

		// Token is valid and is the latest one
		req.user = decoded;
		next();
	});
};

module.exports = authMiddleware;