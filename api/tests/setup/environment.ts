function assertTestDatabase() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error("DATABASE_URL de teste não configurada.");

	const databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");
	if (databaseName !== "helpdesk_test") {
		throw new Error(
			"Testes exigem DATABASE_URL apontando exclusivamente para helpdesk_test.",
		);
	}
}

assertTestDatabase();
