import assert from "node:assert/strict";
import test from "node:test";
import { getPageAfterDeletion } from "../src/modules/admin/clients/client.utils";

test("returns previous page when deleting the last item", () => {
	assert.equal(getPageAfterDeletion(3, 1), 2);
});

test("keeps current page when other items remain", () => {
	assert.equal(getPageAfterDeletion(3, 2), 3);
	assert.equal(getPageAfterDeletion(1, 1), 1);
});
