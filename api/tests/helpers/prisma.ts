import { prisma } from "../../src/libs/prisma";

export async function clearDatabase() {
	await prisma.ticketService.deleteMany();
	await prisma.ticket.deleteMany();
	await prisma.servicePriceLog.deleteMany();
	await prisma.technicianProfile.deleteMany();
	await prisma.clientProfile.deleteMany();
	await prisma.user.deleteMany();
	await prisma.service.deleteMany();
}
