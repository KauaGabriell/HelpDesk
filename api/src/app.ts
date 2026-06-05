import express, { Request, response, Response } from "express";
import "dotenv/config";

const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).send({ message: "API ONLINE" });
});

export { app };
