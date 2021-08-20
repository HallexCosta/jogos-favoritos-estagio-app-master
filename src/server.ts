import express, { Router, Request, Response } from "express";

const app = express();
const port = 3333;

app.use(express.json());

const routes = Router();

/*
DEV API - THIS API IS PAY
http://api.steampowered.com/<interface name>/<method name>/v<version>/?key=<api key>&format=<format>

DEV API - FREE
https://api.steampowered.com/ISteamApps/GetAppList/v2/

LIST ALL APPS
http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=STEAMKEY&format=json

LIST APP DETAILS
http://store.steampowered.com/api/appdetails?appids={APP_ID}
*/

routes.get("/", async (request: Request, response: Response) => {
  return response.json({
    ok: true,
  });
});

app.use(routes);

app.listen(port, () => console.log(`> Listening on port ${port}`));
