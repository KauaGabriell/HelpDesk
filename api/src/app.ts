import "dotenv/config";
import express, { type Request, type Response } from "express";
import { errorHandling } from "./middlewares/errorHandling";
import { routes } from "./routes";

const app = express();
app.use(express.json());

app.use(routes);

app.use(errorHandling);

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).send({ message: "API ONLINE" });
});

export { app };
