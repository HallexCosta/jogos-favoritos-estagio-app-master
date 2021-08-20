import axios from "axios";
import express, { Router, Request, Response } from "express";

import { FavoriteDatabase, FavoriteGame } from "./FavoriteDatabase";

import { CacheProvider } from "./CacheProvider";

const cache = new CacheProvider();

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

type FavoriteGameWithDetails = FavoriteGame & {
  gameDetails: any;
};

routes.get("/favorites", async (request: Request, response: Response) => {
  // Listar jogos favorito do usuário

  const userHash = request.headers["user-hash"].toString();

  const userHasAddedFavorites = favoritesDatabase.has(userHash);

  if (!userHasAddedFavorites) {
    return response.status(400).json({
      message: "Este usuário não possui jogos adicionados aos favoritos",
    });
  }

  async function getGameDetailsFromSteamAPI(gameId: number) {
    const { data } = await api.get(
      `http://store.steampowered.com/api/appdetails?appids=${gameId}`
    );

    const { _, data: gameDetails } = data[gameId];

    return gameDetails;
  }

  function getGameDetailsFromCached(gameId: number) {
    return cache.find<number, FavoriteGameWithDetails>(gameId);
  }

  function getFavoriteGamesFromDatabase() {
    const favoriteGames = favoritesDatabase.findGamesByUserHash(userHash);

    return favoriteGames;
  }

  async function getFavoriteGamesDetails() {
    const favoriteGames = getFavoriteGamesFromDatabase();

    const favoriteGamesWithDetails: FavoriteGameWithDetails[] = [];

    for (const favoriteGame of favoriteGames) {
      const gameIsCached = getGameDetailsFromCached(favoriteGame.game_id);

      if (gameIsCached) {
        const gameDetails = gameIsCached;

        const favoriteGameWithDetails = {
          ...favoriteGame,
          gameDetails,
        };

        console.log("> Game cached");
        favoriteGamesWithDetails.push(favoriteGameWithDetails);
      }

      if (!gameIsCached) {
        const gameDetails = await getGameDetailsFromSteamAPI(
          favoriteGame.game_id
        );

        const favoriteGameWithDetails = {
          ...favoriteGame,
          gameDetails,
        };

        console.log("> Caching game...");
        cache.add<number, FavoriteGameWithDetails>(
          favoriteGame.game_id,
          gameDetails
        );

        favoriteGamesWithDetails.push(favoriteGameWithDetails);
      }
    }

    return favoriteGamesWithDetails;
  }

  const favorites = await getFavoriteGamesDetails();

  return response.json(favorites);
});

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

routes.post("/favorites", (request: Request, response: Response) => {
  // Criar um favorito para o jogo
  // utilizar armazenamento em memória

  const { grade, game_id: gameId } = request.body;
  const userHash = request.headers["user-hash"].toString();

  const favorite: FavoriteGame = {
    grade,
    game_id: gameId,
    user_hash: userHash,
  };

  favoritesDatabase.save(userHash, favorite);

  return response.status(201).json({
    grade,
    game_id: gameId,
    user_hash: userHash,
  });
});

routes.delete("/favorites/:game_id", (request: Request, response: Response) => {
  // Criar um favorito para o jogo
  // utilizar armazenamento em memória

  const gameId = Number(request.params.game_id);
  const userHash = request.headers["user-hash"].toString();

  const userHasAddedFavorites = favoritesDatabase.has(userHash);

  if (!userHasAddedFavorites) {
    return response.status(400).json({
      message: "Este usuário não adicionou nenhum jogo aos favoritos",
    });
  }

  const favorite = favoritesDatabase.findByGameId(userHash, gameId);

  if (!favorite) {
    return response.status(400).json({
      message: "Este jogo já foi removido dos favoritos pelo usuário",
    });
  }

  favoritesDatabase.deleteByGameId(userHash, gameId);

  return response.json({
    delete: true,
    favorite,
  });
});

app.use(routes);

app.listen(port, () => console.log(`> Listening on port ${port}`));
