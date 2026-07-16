import request from "supertest";
import { app } from "../src/app";
import { Role } from "../src/generated/prisma/enums";
import { prisma } from "../src/libs/prisma";
import { createTestToken } from "./helpers/auth";
import {
	createTestAdmin,
	createTestClient,
	createTestService,
	createTestTechnician,
	createTestTicket,
} from "./helpers/factories";

const api = request(app);

function bearer(token: string) {
	return { Authorization: `Bearer ${token}` };
}

describe("users and profiles", () => {
	it("allows an admin to create a technician with a temporary password", async () => {
		const { user: admin } = await createTestAdmin();
		const token = createTestToken(admin.id, Role.admin);

		const response = await api
			.post("/technician")
			.set(bearer(token))
			.send({
				name: "New Technician",
				email: "new.technician@test.com",
				password: "123456",
				availability: ["09:00"],
			});

		expect(response.status).toBe(201);
		expect(response.body).toMatchObject({
			name: "New Technician",
			role: Role.technician,
			mustChangePassword: true,
		});
	});

	it("rejects a duplicate technician email", async () => {
		const { user: admin } = await createTestAdmin();
		const token = createTestToken(admin.id, Role.admin);
		await createTestClient({ email: "duplicate@test.com" });

		const response = await api.post("/technician").set(bearer(token)).send({
			name: "Duplicate Technician",
			email: "duplicate@test.com",
			password: "123456",
		});

		expect(response.status).toBe(400);
	});

	it("assigns default availability when creating a technician without it", async () => {
		const { user: admin } = await createTestAdmin();
		const token = createTestToken(admin.id, Role.admin);

		const response = await api.post("/technician").set(bearer(token)).send({
			name: "Default Availability",
			email: "availability@test.com",
			password: "123456",
		});
		expect(response.status).toBe(201);

		const profile = await prisma.technicianProfile.findUniqueOrThrow({
			where: { userId: response.body.id },
		});
		expect(profile.availability).toEqual([
			"08:00",
			"09:00",
			"10:00",
			"11:00",
			"14:00",
			"15:00",
			"16:00",
			"17:00",
		]);
	});

	it("allows an admin to list technicians with pagination", async () => {
		const { user: admin } = await createTestAdmin();
		const token = createTestToken(admin.id, Role.admin);
		await createTestTechnician({ name: "First Technician" });
		await createTestTechnician({ name: "Second Technician" });

		const response = await api
			.get("/technician?page=1&limit=1")
			.set(bearer(token));

		expect(response.status).toBe(200);
		expect(response.body.data).toHaveLength(1);
		expect(response.body.pagination).toMatchObject({
			totalItems: 2,
			currentPage: 1,
			perPage: 1,
		});
	});

	it("allows a technician to update only their own profile", async () => {
		const { user } = await createTestTechnician({ name: "Before Update" });
		const token = createTestToken(user.id, Role.technician);

		const response = await api
			.patch("/technician/me")
			.set(bearer(token))
			.send({ name: "After Update" });

		expect(response.status).toBe(200);
		expect(response.body.user).toMatchObject({ name: "After Update" });
	});

	it("blocks a technician from the admin update route", async () => {
		const { user: technician } = await createTestTechnician();
		const { user: otherTechnician } = await createTestTechnician();
		const token = createTestToken(technician.id, Role.technician);

		const response = await api
			.patch(`/technician/${otherTechnician.id}`)
			.set(bearer(token))
			.send({ name: "Unauthorized Update" });

		expect(response.status).toBe(403);
	});

	it("registers a client with a profile", async () => {
		const response = await api.post("/auth/register").send({
			name: "Registered Client",
			email: "registered.client@test.com",
			password: "123456",
		});

		expect(response.status).toBe(200);
		expect(response.body.role).toBe(Role.client);

		const profile = await prisma.clientProfile.findUnique({
			where: { userId: response.body.id },
		});
		expect(profile).not.toBeNull();
	});

	it("allows a client to update their own account", async () => {
		const { user } = await createTestClient({ name: "Before Client Update" });
		const token = createTestToken(user.id, Role.client);

		const response = await api
			.patch("/client/me")
			.set(bearer(token))
			.send({ name: "After Client Update" });

		expect(response.status).toBe(200);
		expect(response.body.user).toMatchObject({ name: "After Client Update" });
	});

	it("blocks a client from the admin client update route", async () => {
		const { user: client } = await createTestClient();
		const { user: otherClient } = await createTestClient();
		const token = createTestToken(client.id, Role.client);

		const response = await api
			.patch(`/client/${otherClient.id}`)
			.set(bearer(token))
			.send({ name: "Unauthorized Update" });

		expect(response.status).toBe(403);
	});

	it("deletes a client and cascades their tickets and ticket services", async () => {
		const { user: admin } = await createTestAdmin();
		const { user: client } = await createTestClient();
		const { user: technician } = await createTestTechnician();
		const service = await createTestService();
		const ticket = await createTestTicket({
			clientId: client.id,
			technicianId: technician.id,
			serviceIds: [service.id],
		});
		const token = createTestToken(admin.id, Role.admin);

		const response = await api
			.delete(`/client/${client.id}`)
			.set(bearer(token));

		expect(response.status).toBe(200);
		expect(
			await prisma.user.findUnique({ where: { id: client.id } }),
		).toBeNull();
		expect(
			await prisma.clientProfile.findUnique({ where: { userId: client.id } }),
		).toBeNull();
		expect(
			await prisma.ticket.findUnique({ where: { id: ticket.id } }),
		).toBeNull();
		expect(
			await prisma.ticketService.count({ where: { ticketId: ticket.id } }),
		).toBe(0);
	});
});
