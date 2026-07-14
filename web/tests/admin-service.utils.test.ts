import assert from "node:assert/strict";
import test from "node:test";
import {
	formatServiceCategory,
	formatServiceCurrency,
	toServicePayload,
} from "../src/modules/admin/services/service.utils";

test("formats service price as BRL", () => {
	assert.equal(formatServiceCurrency("180"), "R$ 180,00");
});

test("translates service categories to Portuguese", () => {
	assert.equal(formatServiceCategory("network"), "Rede");
	assert.equal(formatServiceCategory("others"), "Outros");
});

test("trims form text and converts price before sending service payload", () => {
	assert.deepEqual(
		toServicePayload({
			name: "  Instalação de Rede  ",
			price: "180.5",
			serviceCategory: "network",
		}),
		{
			name: "Instalação de Rede",
			price: 180.5,
			category: "network",
		},
	);
});
