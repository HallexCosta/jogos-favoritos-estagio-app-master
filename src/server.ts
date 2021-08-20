import axios from "axios";
import express, { Router, Request, Response } from "express";
import { FavoriteDatabase, Favorite } from "./databases";

const api = axios.create();

const app = express();
const port = 3333;

const favoritesDatabase = new FavoriteDatabase();

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

  const { grade, game_id: gameId } = request.body;
  const userHash = request.headers["user-hash"].toString();

  const favorite: Favorite = {
    grade,
    gameId,
    userHash,
  };

  favoritesDatabase.save(userHash, favorite);

  return response.status(201).json({
    grade,
    game_id: gameId,
    user_hash: userHash,
  });
});

routes.delete(
  "/favorites/:game_id",
  async (request: Request, response: Response) => {
    // Criar um favorito para o jogo
    // utilizar armazenamento em memória

    const gameId = Number(request.params.game_id);
    const userHash = request.headers["user-hash"].toString();

    function checkUserExists(favoriteUserHash: string, userHash: string) {
      if (favoriteUserHash === userHash) {
        return true;
      }

      console.log("> Usuário não foi encontrado");
      return false;
    }

    const favoritesByUserHash = databases.favoritesDatabase.filter((favorite) =>
      checkUserExists(favorite.user_hash, userHash)
    );

    if (!favoritesByUserHash) {
      return response.status(400).json({
        delete: false,
        message: "Usuário não foi encontrado",
      });
    }

    function checkForGameHasFavorited(
      gameIdFromDatabase: number,
      gameId: number
    ) {
      if (gameIdFromDatabase === gameId) {
        return true;
      }

      console.log("> O jogo não foi favoritado por este usuário: ", userHash);
      return false;
    }

    const favorite = favoritesByUserHash.find((favorite) =>
      checkForGameHasFavorited(favorite.game_id, gameId)
    );

    if (!favorite) {
      return response.status(400).json({
        delete: false,
        message: "O jogo não foi favoritado por este usuário",
      });
    }

    function removeFavoriteGameFromDatabaseByGameId(gameId: number) {
      const temp: Favorite[] = [];

      for (const favorite of databases.favoritesDatabase) {
        if (favorite.game_id !== gameId) {
          temp.push(favorite);
        }
      }

      databases.favoritesDatabase = temp;
    }

    removeFavoriteGameFromDatabaseByGameId(favorite.game_id);

    return response.json({
      delete: true,
      favorite,
    });
  }
);

app.use(routes);

app.listen(port, () => console.log(`> Listening on port ${port}`));
