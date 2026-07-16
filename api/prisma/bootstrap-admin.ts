import { Role } from "../src/generated/prisma/enums";
import { prisma } from "../src/libs/prisma";

const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
const adminPasswordHash = process.env.BOOTSTRAP_ADMIN_PASSWORD_HASH;

async function bootstrapAdmin() {
	if (!adminEmail || !adminPasswordHash) {
		throw new Error("Bootstrap admin credentials are required");
	}

	const admin = await prisma.user.findUnique({
		where: { email: adminEmail },
		select: { id: true },
	});

	if (admin) return;

	await prisma.user.create({
		data: {
			name: "Admin",
			email: adminEmail,
			passwordHash: adminPasswordHash,
			role: Role.admin,
		},
	});
}

bootstrapAdmin()
	.catch((error) => {
		console.error("Failed to bootstrap admin user", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
