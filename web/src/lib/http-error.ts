class HttpError extends Error {
	statusCode: number;
	body: unknown;

	constructor(statusCode: number, message: string, body?: unknown) {
		super(message);
		this.name = "HttpError";
		this.statusCode = statusCode;
		this.body = body;
	}
}

export { HttpError };
