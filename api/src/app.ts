import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { env } from "./config/env";
import uploadConfig from "./config/upload";
import { errorHandling } from "./middlewares/errorHandling";
import { routes } from "./routes";

const app = express();
app.use(cors({ origin: env.CORS_ORIGINS }));
app.use(express.json());

app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER));
app.use(routes);

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).send({ message: "API ONLINE" });
});

app.use(errorHandling);

export { app };
