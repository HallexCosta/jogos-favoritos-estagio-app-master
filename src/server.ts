import express, { Router, Request, Response } from "express";

const app = express();
const port = 3333;

app.use(express.json());

const routes = Router();

routes.get("/", async (request: Request, response: Response) => {
  return response.json({
    ok: true,
  });
});

app.use(routes);

app.listen(port, () => console.log(`> Listening on port ${port}`));
