import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import uploadConfig from "./config/upload";
import { errorHandling } from "./middlewares/errorHandling";
import { routes } from "./routes";

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER));
app.use(routes);

app.use(errorHandling);

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).send({ message: "API ONLINE" });
});

export { app };
