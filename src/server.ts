import axios from "axios";
import express, { Router, Request, Response } from "express";
import { Databases, Favorite } from "./databases";

const api = axios.create();

const app = express();
const port = 3333;

const databases = new Databases();

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

type SteamGetAppList = {
  id: number;
  name: string;
};

type SteamAPIResponse = {
  applist: {
    apps: SteamGetAppList[];
  };
};

routes.get("/", async (request: Request, response: Response) => {
  // Listar todos os jogos
  // BODY: título do jogo
  // Filtrar jogos usando título do jogo

  const title = request.query.title as string;

  const { data } = await api.get<SteamAPIResponse>(
    "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
  );

  const { apps: games } = data.applist;

  function searchGameByTitle(gameName: string, gameTitle: string) {
    const regex = new RegExp(gameTitle, "gi");

    return gameName.match(regex);
  }

  const filteredGames = games.filter((game) =>
    searchGameByTitle(game.name, title)
  );

  return response.json(filteredGames);
});

routes.get("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  const { data } = await api.get(
    `http://store.steampowered.com/api/appdetails?appids=${id}`
  );

  const { _, data: gameDetails } = data[id];

  return response.json(gameDetails);
});

routes.post("/favorites", async (request: Request, response: Response) => {
  // Criar um favorito para o jogo
  // utilizar armazenamento em memória

  const { grade, game_id } = request.body;
  const user_hash = request.headers["user-hash"].toString();

  const favorite: Favorite = {
    grade,
    game_id,
    user_hash,
  };

  databases.favoritesDatabase.push(favorite);

  return response.json({
    favorite,
  });
});

app.use(routes);

app.listen(port, () => console.log(`> Listening on port ${port}`));
