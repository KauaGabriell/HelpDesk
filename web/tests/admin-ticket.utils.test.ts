import assert from "node:assert/strict";
import test from "node:test";
import {
	formatCurrency,
	getAdditionalServices,
	getBasePrice,
	getTicketServiceName,
	ticketStatusConfig,
} from "../src/modules/admin/tickets/ticket.utils";

const services = [
	{
		title: null,
		description: null,
		price: 200,
		service: { name: "Recuperação de Dados", price: 200 },
	},
	{
		title: "Assinatura de backup",
		description: null,
		price: 120,
		service: null,
	},
];

test("maps each ticket status to its visual label", () => {
	assert.equal(ticketStatusConfig.open.label, "Aberto");
	assert.equal(ticketStatusConfig.in_progress.label, "Em atendimento");
	assert.equal(ticketStatusConfig.closed.label, "Encerrado");
});

test("uses catalog name and falls back to custom service title", () => {
	assert.equal(getTicketServiceName(services[0]), "Recuperação de Dados");
	assert.equal(getTicketServiceName(services[1]), "Assinatura de backup");
});

test("separates base price from additional services", () => {
	assert.equal(getBasePrice(services), 200);
	assert.deepEqual(getAdditionalServices(services), [services[1]]);
});

test("formats Prisma decimal strings as BRL", () => {
	assert.match(formatCurrency("120.50"), /R\$\s*120,50/);
});
