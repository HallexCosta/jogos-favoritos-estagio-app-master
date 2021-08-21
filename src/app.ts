import express from "express";

import { routes } from "./routes";

export const app = express();

export const port = process.env.PORT || 3333;

app.use(express.json());

app.use(routes);
