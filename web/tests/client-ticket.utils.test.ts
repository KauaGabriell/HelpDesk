import assert from "node:assert/strict";
import test from "node:test";
import { mergeClientProfileMutation } from "../src/modules/client/profile/client-profile.utils";
import {
	formatClientCurrency,
	toCreateClientTicketPayload,
} from "../src/modules/client/tickets/client-ticket.utils";

test("creates one-service ticket payload", () => {
	assert.deepEqual(
		toCreateClientTicketPayload({
			title: "  Rede lenta ",
			description: "  Internet cai ",
			serviceId: "service-1",
		}),
		{
			title: "Rede lenta",
			description: "Internet cai",
			serviceIds: ["service-1"],
		},
	);
});

test("omits empty ticket description", () => {
	assert.deepEqual(
		toCreateClientTicketPayload({
			title: "Rede lenta",
			description: "   ",
			serviceId: "service-1",
		}),
		{ title: "Rede lenta", serviceIds: ["service-1"] },
	);
});

test("formats ticket prices as BRL", () => {
	assert.equal(formatClientCurrency("200"), "R$ 200,00");
});

test("merges nested client profile mutations", () => {
	const profile = mergeClientProfileMutation(
		{
			id: "client-1",
			name: "Andre",
			email: "andre@test.com",
			clientProfile: { avatarUrl: "/uploads/old.png" },
		},
		{
			user: { id: "client-1", name: "Andre Costa", email: "novo@test.com" },
			profile: { avatarUrl: "/uploads/new.png" },
		},
	);

	assert.deepEqual(profile, {
		id: "client-1",
		name: "Andre Costa",
		email: "novo@test.com",
		clientProfile: { avatarUrl: "/uploads/new.png" },
	});
});
