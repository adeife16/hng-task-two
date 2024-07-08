const fs = require("fs");
const path = require("path");

const tokenFilePath = path.join(__dirname, "tokenStore.json");

const readTokenStore = () => {
	try {
		const data = fs.readFileSync(tokenFilePath, "utf8");
		return JSON.parse(data);
	} catch (err) {
		return {};
	}
};

const writeTokenStore = (tokenStore) => {
	fs.writeFileSync(
		tokenFilePath,
		JSON.stringify(tokenStore, null, 2),
		"utf8"
	);
};

module.exports = {
	setToken: (userId, token) => {
		const tokenStore = readTokenStore();
		tokenStore[userId] = token;
		writeTokenStore(tokenStore);
	},
	getToken: (userId) => {
		const tokenStore = readTokenStore();
		return tokenStore[userId];
	},
};
