import bcrypt from "bcrypt";
import {
	Role,
	ServiceCategory,
	TicketStatus,
} from "../src/generated/prisma/enums";
import { prisma } from "../src/libs/prisma";

const hash = await bcrypt.hash("123456", 10);

const adminUser = {
	name: "admin",
	email: "admin@admin.com",
	password: hash,
	role: Role.admin,
};

const technicians = [
	{
		name: "Carlos Silva",
		email: "carlos.silva@test.com",
		password: hash,
		availability: [
			"08:00",
			"09:00",
			"10:00",
			"11:00",
			"14:00",
			"15:00",
			"16:00",
			"17:00",
		],
	},
	{
		name: "Ana Oliveira",
		email: "ana.oliveira@test.com",
		password: hash,
		availability: [
			"10:00",
			"11:00",
			"12:00",
			"13:00",
			"16:00",
			"17:00",
			"18:00",
			"19:00",
		],
	},
	{
		name: "Bruno Santos",
		email: "bruno.santos@test.com",
		password: hash,
		availability: [
			"12:00",
			"13:00",
			"14:00",
			"15:00",
			"18:00",
			"19:00",
			"20:00",
			"21:00",
		],
	},
];

const clientUser = {
	name: "Andre Costa",
	email: "andre.costa@test.com",
	password: hash,
};

const services = [
	{
		name: "Formatação de Computador",
		category: ServiceCategory.software,
		price: 200.0,
		isActive: true,
	},
	{
		name: "Troca de Placa de Vídeo",
		category: ServiceCategory.hardware,
		price: 250.0,
		isActive: true,
	},
	{
		name: "Treinamento sobre o sistema",
		category: ServiceCategory.support,
		price: 50.0,
		isActive: true,
	},
	{
		name: "Adicionando camada de segurança no login dos funcionários",
		category: ServiceCategory.security,
		price: 330.0,
		isActive: true,
	},
	{
		name: "Troca completa do processador, HD, e Placa mãe do Computador",
		category: ServiceCategory.hardware,
		price: 1460.0,
		isActive: true,
	},
];

const seed = async () => {
	await prisma.ticketService.deleteMany();
	await prisma.ticket.deleteMany();
	await prisma.servicePriceLog.deleteMany();
	await prisma.technicianProfile.deleteMany();
	await prisma.clientProfile.deleteMany();
	await prisma.user.deleteMany();
	await prisma.service.deleteMany();

	await prisma.user.create({
		data: {
			name: adminUser.name,
			email: adminUser.email,
			passwordHash: adminUser.password,
			role: adminUser.role,
		},
	});

	const createdTechnicians = [];

	for (const technician of technicians) {
		const createdTechnician = await prisma.user.create({
			data: {
				name: technician.name,
				email: technician.email,
				passwordHash: technician.password,
				role: Role.technician,
				mustChangePassword: true,
				technicianProfile: {
					create: {
						availability: technician.availability,
					},
				},
			},
			select: {
				id: true,
			},
		});

		createdTechnicians.push(createdTechnician);
	}

	const createdServices = [];

	for (const service of services) {
		const createdService = await prisma.service.create({
			data: {
				name: service.name,
				serviceCategory: service.category,
				price: service.price,
				isActive: service.isActive,
			},
			select: {
				id: true,
				price: true,
			},
		});

		createdServices.push(createdService);
	}

	const createdClient = await prisma.user.create({
		data: {
			name: clientUser.name,
			email: clientUser.email,
			passwordHash: clientUser.password,
			role: Role.client,
			clientProfile: {
				create: {},
			},
		},
		select: {
			id: true,
		},
	});

	await prisma.ticket.create({
		data: {
			title: "Rede lenta",
			description: "Cliente relata lentidao constante na rede do escritorio.",
			clientId: createdClient.id,
			technicianId: createdTechnicians[0].id,
			status: TicketStatus.open,
			ticketServices: {
				create: {
					serviceId: createdServices[0].id,
					addedById: createdTechnicians[0].id,
					price: createdServices[0].price,
				},
			},
		},
	});

	await prisma.ticket.create({
		data: {
			title: "Backup nao esta funcionando",
			description: "Cliente informa falha ao executar rotina de backup.",
			clientId: createdClient.id,
			technicianId: createdTechnicians[1].id,
			status: TicketStatus.in_progress,
			ticketServices: {
				create: {
					serviceId: createdServices[2].id,
					addedById: createdTechnicians[1].id,
					price: createdServices[2].price,
				},
			},
		},
	});
};

seed()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
