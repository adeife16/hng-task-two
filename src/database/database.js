const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// log database errors
prisma.$on("error", (e) => {
	console.error(`Error in Prisma client: `, e);
});

// log database disconnect errors
prisma.$on("disconnect", (e) => {
	console.error(`Error in Prisma client disconnect: `, e);
});

// log database connection errors
prisma.$on("connect", () => {
	console.log(`Connected to Prisma client`);
});

module.exports = prisma;
