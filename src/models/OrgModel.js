const prisma = require("../database/database");

class OrgModel {
	constructor() {
		this.prisma = prisma;
	}

	async createOrg(org) {
		return await this.prisma.org.create({ data: org });
	}
	
	async getUserOrgs({ userId }) {
		return await this.prisma.userOrg.findMany({ where: { userId } });
	}

	async getOrg({ orgId }) {
		return await this.prisma.org.findUnique({ where: { orgId } });
	}

	async getUserOrg({ userId, orgId }) {
		return await this.prisma.userOrg.findUnique({ where: { userId_orgId: { userId, orgId } } });
	}

	async addUserToOrg({ userId, orgId }) {
		return await this.prisma.userOrg.create({ data: { userId, orgId } });
	}

}

module.exports = OrgModel;
