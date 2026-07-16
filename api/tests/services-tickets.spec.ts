import request from "supertest";
import { app } from "../src/app";
import { Role, TicketStatus } from "../src/generated/prisma/enums";
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

async function createTicketThroughApi(serviceIds: string[]) {
	const { user: client } = await createTestClient();
	const { user: technician } = await createTestTechnician();
	const token = createTestToken(client.id, Role.client);
	const response = await api.post("/tickets/client").set(bearer(token)).send({
		title: "API ticket",
		description: "Created through the HTTP endpoint",
		serviceIds,
	});

	return { client, technician, response };
}

describe("services and tickets", () => {
	it("allows an admin to create a service", async () => {
		const { user: admin } = await createTestAdmin();
		const token = createTestToken(admin.id, Role.admin);

		const response = await api.post("/services").set(bearer(token)).send({
			name: "Network Setup",
			price: 180,
			category: "network",
		});

		expect(response.status).toBe(201);
		expect(response.body).toMatchObject({
			name: "Network Setup",
			serviceCategory: "network",
			isActive: true,
		});
	});

	it("records a price log when an admin updates a service price", async () => {
		const { user: admin } = await createTestAdmin();
		const service = await createTestService({ price: 100 });
		const token = createTestToken(admin.id, Role.admin);

		const response = await api
			.patch(`/services/${service.id}`)
			.set(bearer(token))
			.send({ price: 150 });

		expect(response.status).toBe(200);
		expect(String(response.body.price)).toBe("150");

		const logs = await prisma.servicePriceLog.findMany({
			where: { serviceId: service.id },
		});
		expect(logs).toHaveLength(1);
		expect(logs[0]).toMatchObject({ changedById: admin.id });
		expect(String(logs[0].oldPrice)).toBe("100");
		expect(String(logs[0].newPrice)).toBe("150");
	});

	it("allows an admin to deactivate and reactivate a service", async () => {
		const { user: admin } = await createTestAdmin();
		const service = await createTestService();
		const token = createTestToken(admin.id, Role.admin);

		const deactivate = await api
			.patch(`/services/${service.id}/status`)
			.set(bearer(token))
			.send({ isActive: false });
		expect(deactivate.status).toBe(200);
		expect(deactivate.body.isActive).toBe(false);

		const reactivate = await api
			.patch(`/services/${service.id}/status`)
			.set(bearer(token))
			.send({ isActive: true });
		expect(reactivate.status).toBe(200);
		expect(reactivate.body.isActive).toBe(true);
	});

	it("returns only active services to a client", async () => {
		const { user: client } = await createTestClient();
		const activeService = await createTestService({ isActive: true });
		const inactiveService = await createTestService({ isActive: false });
		const token = createTestToken(client.id, Role.client);

		const response = await api.get("/services/active").set(bearer(token));

		expect(response.status).toBe(200);
		expect(
			response.body.map((service: { id: string }) => service.id),
		).toContain(activeService.id);
		expect(
			response.body.map((service: { id: string }) => service.id),
		).not.toContain(inactiveService.id);
	});

	it("creates a ticket with one service and an assigned technician", async () => {
		const service = await createTestService({ price: 180 });
		const { technician, response } = await createTicketThroughApi([service.id]);

		expect(response.status).toBe(201);
		expect(response.body.technician).toMatchObject({ name: technician.name });
		expect(response.body.ticketServices).toHaveLength(1);
		expect(response.body.totalPrice).toBe(180);
	});

	it("creates one ticket service for each selected service", async () => {
		const firstService = await createTestService({ price: 100 });
		const secondService = await createTestService({ price: 80 });
		const { response } = await createTicketThroughApi([
			firstService.id,
			secondService.id,
		]);

		expect(response.status).toBe(201);
		expect(response.body.ticketServices).toHaveLength(2);
		expect(response.body.totalPrice).toBe(180);
	});

	it("rejects ticket creation without services", async () => {
		const { user: client } = await createTestClient();
		const token = createTestToken(client.id, Role.client);

		const response = await api.post("/tickets/client").set(bearer(token)).send({
			title: "Empty ticket",
			serviceIds: [],
		});

		expect(response.status).toBe(400);
	});

	it("rejects ticket creation with an inactive service", async () => {
		const { user: client } = await createTestClient();
		await createTestTechnician();
		const inactiveService = await createTestService({ isActive: false });
		const token = createTestToken(client.id, Role.client);

		const response = await api
			.post("/tickets/client")
			.set(bearer(token))
			.send({
				title: "Inactive service ticket",
				serviceIds: [inactiveService.id],
			});

		expect(response.status).toBe(404);
	});

	it("rejects ticket creation with an unknown service", async () => {
		const { user: client } = await createTestClient();
		await createTestTechnician();
		const token = createTestToken(client.id, Role.client);

		const response = await api
			.post("/tickets/client")
			.set(bearer(token))
			.send({
				title: "Unknown service ticket",
				serviceIds: [crypto.randomUUID()],
			});

		expect(response.status).toBe(404);
	});

	it("keeps the ticket service price after the catalog price changes", async () => {
		const { user: admin } = await createTestAdmin();
		const service = await createTestService({ price: 100 });
		const { response } = await createTicketThroughApi([service.id]);
		const token = createTestToken(admin.id, Role.admin);

		const updateResponse = await api
			.patch(`/services/${service.id}`)
			.set(bearer(token))
			.send({ price: 250 });
		expect(updateResponse.status).toBe(200);

		const ticketService = await prisma.ticketService.findFirstOrThrow({
			where: { ticketId: response.body.id, serviceId: service.id },
		});
		expect(String(ticketService.price)).toBe("100");
	});

	it("lists only tickets assigned to the authenticated technician", async () => {
		const { user: client } = await createTestClient();
		const { user: technician } = await createTestTechnician();
		const { user: otherTechnician } = await createTestTechnician();
		const service = await createTestService();
		const assignedTicket = await createTestTicket({
			clientId: client.id,
			technicianId: technician.id,
			serviceIds: [service.id],
		});
		await createTestTicket({
			clientId: client.id,
			technicianId: otherTechnician.id,
			serviceIds: [service.id],
		});
		const token = createTestToken(technician.id, Role.technician);

		const response = await api.get("/tickets/technician/me").set(bearer(token));

		expect(response.status).toBe(200);
		expect(response.body.data).toHaveLength(1);
		expect(response.body.data[0].id).toBe(assignedTicket.id);
	});

	it("allows a technician to start a ticket and add an extra service", async () => {
		const { user: client } = await createTestClient();
		const { user: technician } = await createTestTechnician();
		const service = await createTestService();
		const ticket = await createTestTicket({
			clientId: client.id,
			technicianId: technician.id,
			serviceIds: [service.id],
		});
		const token = createTestToken(technician.id, Role.technician);

		const startResponse = await api
			.patch(`/tickets/technician/${ticket.id}/start`)
			.set(bearer(token));
		expect(startResponse.status).toBe(200);
		expect(startResponse.body.status).toBe(TicketStatus.in_progress);

		const extraResponse = await api
			.post(`/tickets/technician/${ticket.id}/extra-services`)
			.set(bearer(token))
			.send({ title: "Extra work", description: "On-site work", price: 75 });
		expect(extraResponse.status).toBe(201);
		expect(extraResponse.body).toMatchObject({
			title: "Extra work",
			serviceId: null,
			addedById: technician.id,
		});
		expect(String(extraResponse.body.price)).toBe("75");
	});

	it("enforces technician ticket transitions and closes tickets in progress", async () => {
		const { user: client } = await createTestClient();
		const { user: technician } = await createTestTechnician();
		const service = await createTestService();
		const ticket = await createTestTicket({
			clientId: client.id,
			technicianId: technician.id,
			serviceIds: [service.id],
		});
		const token = createTestToken(technician.id, Role.technician);

		const closeOpen = await api
			.patch(`/tickets/technician/${ticket.id}/close`)
			.set(bearer(token));
		expect(closeOpen.status).toBe(400);

		const addWhileOpen = await api
			.post(`/tickets/technician/${ticket.id}/extra-services`)
			.set(bearer(token))
			.send({ title: "Blocked extra", price: 10 });
		expect(addWhileOpen.status).toBe(400);

		const start = await api
			.patch(`/tickets/technician/${ticket.id}/start`)
			.set(bearer(token));
		expect(start.status).toBe(200);

		const startAgain = await api
			.patch(`/tickets/technician/${ticket.id}/start`)
			.set(bearer(token));
		expect(startAgain.status).toBe(400);

		const close = await api
			.patch(`/tickets/technician/${ticket.id}/close`)
			.set(bearer(token));
		expect(close.status).toBe(200);
		expect(close.body.status).toBe(TicketStatus.closed);

		const startClosed = await api
			.patch(`/tickets/technician/${ticket.id}/start`)
			.set(bearer(token));
		expect(startClosed.status).toBe(400);
	});

	it("allows an admin to apply valid status transitions and rejects invalid ones", async () => {
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

		const invalidTransition = await api
			.patch(`/tickets/admin/${ticket.id}`)
			.set(bearer(token))
			.send({ status: TicketStatus.closed });
		expect(invalidTransition.status).toBe(400);

		const start = await api
			.patch(`/tickets/admin/${ticket.id}`)
			.set(bearer(token))
			.send({ status: TicketStatus.in_progress });
		expect(start.status).toBe(200);

		const close = await api
			.patch(`/tickets/admin/${ticket.id}`)
			.set(bearer(token))
			.send({ status: TicketStatus.closed });
		expect(close.status).toBe(200);
		expect(close.body.status).toBe(TicketStatus.closed);
	});

	it("does not expose a client ticket edit route and blocks restricted routes", async () => {
		const { user: client } = await createTestClient();
		const { user: technician } = await createTestTechnician();
		const service = await createTestService();
		const ticket = await createTestTicket({
			clientId: client.id,
			technicianId: technician.id,
			serviceIds: [service.id],
		});
		const token = createTestToken(client.id, Role.client);

		const editResponse = await api
			.patch(`/tickets/client/${ticket.id}`)
			.set(bearer(token))
			.send({ title: "Blocked update" });
		expect(editResponse.status).toBe(404);

		const adminResponse = await api
			.patch(`/tickets/admin/${ticket.id}`)
			.set(bearer(token))
			.send({ status: TicketStatus.in_progress });
		expect(adminResponse.status).toBe(403);
	});
});
