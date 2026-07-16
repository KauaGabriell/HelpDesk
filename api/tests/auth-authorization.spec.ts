import request from "supertest";
import { app } from "../src/app";
import { Role } from "../src/generated/prisma/enums";
import { prisma } from "../src/libs/prisma";
import { createTestToken } from "./helpers/auth";
import {
	createTestAdmin,
	createTestClient,
	createTestTechnician,
} from "./helpers/factories";

const api = request(app);

function bearer(token: string) {
	return { Authorization: `Bearer ${token}` };
}

describe("authentication and authorization", () => {
	it("logs in with valid credentials", async () => {
		const { user, password } = await createTestClient({
			email: "client@login.test",
		});

		const response = await api
			.post("/auth/login")
			.send({ email: user.email, password });

		expect(response.status).toBe(200);
		expect(response.body.token).toEqual(expect.any(String));
		expect(response.body.user).toMatchObject({
			id: user.id,
			email: user.email,
			role: Role.client,
		});
		expect(response.body.user.passwordHash).toBeUndefined();
	});

	it("rejects login for an unknown email", async () => {
		const response = await api
			.post("/auth/login")
			.send({ email: "missing@login.test", password: "123456" });

		expect(response.status).toBe(401);
		expect(response.body.token).toBeUndefined();
	});

	it("rejects login with an invalid password", async () => {
		const { user } = await createTestClient({ email: "wrong@login.test" });

		const response = await api
			.post("/auth/login")
			.send({ email: user.email, password: "654321" });

		expect(response.status).toBe(401);
		expect(response.body.token).toBeUndefined();
	});

	it("rejects a protected route without a token", async () => {
		const response = await api.get("/technician");

		expect(response.status).toBe(401);
	});

	it("rejects a protected route with an invalid token", async () => {
		const response = await api.get("/technician").set(bearer("invalid-token"));

		expect(response.status).toBe(401);
	});

	it("allows an admin to access an admin route", async () => {
		const { user } = await createTestAdmin();
		const token = createTestToken(user.id, Role.admin);

		const response = await api.get("/technician").set(bearer(token));

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			data: [],
			pagination: expect.any(Object),
		});
	});

	it("blocks a client from an admin route", async () => {
		const { user } = await createTestClient();
		const token = createTestToken(user.id, Role.client);

		const response = await api.get("/technician").set(bearer(token));

		expect(response.status).toBe(403);
	});

	it("returns authenticated user and profile from GET /auth/me", async () => {
		const { user } = await createTestClient({ name: "Profile Client" });
		const token = createTestToken(user.id, Role.client);

		const response = await api.get("/auth/me").set(bearer(token));

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			id: user.id,
			name: "Profile Client",
			role: Role.client,
			profile: { avatarUrl: null },
		});
	});

	it("changes technician password and clears mustChangePassword", async () => {
		const { user, password } = await createTestTechnician({
			mustChangePassword: true,
		});
		const token = createTestToken(user.id, Role.technician);

		const changeResponse = await api
			.patch("/technician/me/password")
			.set(bearer(token))
			.send({ oldPassword: password, newPassword: "654321" });

		expect(changeResponse.status).toBe(200);
		expect(changeResponse.body.mustChangePassword).toBe(false);

		const loginResponse = await api
			.post("/auth/login")
			.send({ email: user.email, password: "654321" });
		expect(loginResponse.status).toBe(200);

		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(updatedUser.mustChangePassword).toBe(false);
	});

	it("rejects incorrect and repeated technician passwords", async () => {
		const { user, password } = await createTestTechnician();
		const token = createTestToken(user.id, Role.technician);

		const incorrectPassword = await api
			.patch("/technician/me/password")
			.set(bearer(token))
			.send({ oldPassword: "654321", newPassword: "111111" });
		expect(incorrectPassword.status).toBe(400);

		const repeatedPassword = await api
			.patch("/technician/me/password")
			.set(bearer(token))
			.send({ oldPassword: password, newPassword: password });
		expect(repeatedPassword.status).toBe(400);
	});

	it("blocks sensitive technician routes until the temporary password changes", async () => {
		const { user } = await createTestTechnician({ mustChangePassword: true });
		const token = createTestToken(user.id, Role.technician);

		const response = await api.get("/tickets/technician/me").set(bearer(token));

		expect(response.status).toBe(403);
		expect(response.body.message).toBe(
			"Altere sua senha para acessar esta funcionalidade.",
		);
	});
});
