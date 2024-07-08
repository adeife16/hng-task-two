const prisma = require("../database/database");
const bcrypt = require("bcrypt");

class UserOrgModel {
    constructor() {
        this.prisma = prisma;
    }
    
    async addUserToOrg(userId, orgId) {
        return await this.prisma.userOrg.create({ data: { userId, orgId } });
    }

    async getUserOrgs(userId) {
        return await this.prisma.userOrg.findMany({ where: { userId } });
    }
}

module.exports = UserOrgModel;