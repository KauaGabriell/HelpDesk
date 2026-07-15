import assert from "node:assert/strict";
import test from "node:test";
import {
	getTechnicianTicketServiceName,
	groupTechnicianTicketsByStatus,
	toExtraServicePayload,
} from "../src/modules/technician/tickets/technician-ticket.utils";

test("groups technician tickets by status", () => {
	const grouped = groupTechnicianTicketsByStatus([
		{ id: "open", status: "open" },
		{ id: "progress", status: "in_progress" },
		{ id: "closed", status: "closed" },
	]);

	assert.deepEqual(
		grouped.open.map((ticket) => ticket.id),
		["open"],
	);
	assert.deepEqual(
		grouped.in_progress.map((ticket) => ticket.id),
		["progress"],
	);
	assert.deepEqual(
		grouped.closed.map((ticket) => ticket.id),
		["closed"],
	);
});

test("uses catalog name before custom ticket-service title", () => {
	assert.equal(
		getTechnicianTicketServiceName({
			service: { name: "Instalação de rede" },
			title: null,
		}),
		"Instalação de rede",
	);
	assert.equal(
		getTechnicianTicketServiceName({ service: null, title: "Visita extra" }),
		"Visita extra",
	);
});

test("trims extra-service input and converts decimal price", () => {
	assert.deepEqual(
		toExtraServicePayload({
			title: "  Assinatura de backup ",
			description: "  Serviço mensal ",
			price: "120.5",
		}),
		{
			title: "Assinatura de backup",
			description: "Serviço mensal",
			price: 120.5,
		},
	);
});
