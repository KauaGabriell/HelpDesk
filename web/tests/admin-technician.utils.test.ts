import assert from "node:assert/strict";
import test from "node:test";
import {
	getAvailabilitySummary,
	sortAvailability,
} from "../src/modules/admin/technicians/technician.utils";

test("sorts technician availability chronologically", () => {
	assert.deepEqual(sortAvailability(["16:00", "08:00", "13:00"]), [
		"08:00",
		"13:00",
		"16:00",
	]);
});

test("returns visible hours and remaining count", () => {
	assert.deepEqual(
		getAvailabilitySummary(["08:00", "09:00", "10:00"], 1),
		{
			visible: ["08:00"],
			remaining: 2,
		},
	);
});
