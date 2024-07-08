const prisma = require("../database/database");
const bcrypt = require("bcrypt");

class UserModel {

	constructor() {
		this.prisma = prisma;
	}

	async getUser(where) {
		return await this.prisma.user.findUnique({ where });
	}

	async createUser(user) {
		return await this.prisma.user.create({ data: user });
	}

	async comparePassword(password, hash) {
		return await bcrypt.compare(password, hash);
	}

	async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}
}

module.exports = UserModel;