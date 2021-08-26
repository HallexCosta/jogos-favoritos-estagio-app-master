import axios from "axios";
import { Router, Request, Response } from "express";

import { FavoriteDatabase, FavoriteGame } from "./FavoriteDatabase";
import { CacheProvider } from "./CacheProvider";

const routes = Router();

const cache = new CacheProvider();
cache.add("steam-apps", []);

const api = axios.create();

const favoritesDatabase = new FavoriteDatabase();

type SteamGetAppList = {
  appid: number;
  name: string;
};

type GameDetails = any;

type SteamAPIResponse = {
  applist: {
    apps: {
      app: SteamGetAppList[];
    };
  };
};

type FavoriteGameWithDetails = FavoriteGame & {
  gameDetails: GameDetails;
};

routes.get("/favorites", async (request: Request, response: Response) => {
  const userHash = request.headers["user-hash"] as string;

  if (!userHash) {
    return response.status(403).json({
      message: 'Informe um "user-hash"',
    });
  }

  const favoriteGames = favoritesDatabase.findGamesByUserHash(userHash);

  if (!favoriteGames) {
    return response.status(204).send();
  }

  async function getGameDetailsFromSteamAPI(gameId: number) {
    const { data } = await api.get(
      `http://store.steampowered.com/api/appdetails?appids=${gameId}`
    );

    const { _, data: gameDetails } = data[gameId];

    return gameDetails;
  }

  function getGameDetailsFromCached(gameId: number) {
    return cache.find<FavoriteGameWithDetails>(gameId);
  }

  function getFavoriteGamesFromDatabase(userHash: string) {
    const favoriteGames = favoritesDatabase.findGamesByUserHash(userHash);

    return favoriteGames;
  }

  async function getFavoriteGamesDetails(userHash: string) {
    const favoriteGames = getFavoriteGamesFromDatabase(userHash);

    const favoriteGamesWithDetails: FavoriteGameWithDetails[] = [];

    for (const favoriteGame of favoriteGames) {
      const gameIsCached = getGameDetailsFromCached(favoriteGame.game_id);

      if (gameIsCached) {
        const gameDetails = gameIsCached;

        const favoriteGameWithDetails = {
          ...favoriteGame,
          gameDetails,
        };

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

        cache.add<number, FavoriteGameWithDetails>(
          favoriteGame.game_id,
          gameDetails
        );

        favoriteGamesWithDetails.push(favoriteGameWithDetails);
      }
    }

    return favoriteGamesWithDetails;
  }

  const favorites = await getFavoriteGamesDetails(userHash);

  return response.json(favorites);
});

routes.get("/", async (_, response: Response) => {
  function getGamesFromCache() {
    const gamesFromCache = cache.find<SteamGetAppList[]>("steam-apps");

    return gamesFromCache;
  }

  const gamesAlreadyCached = getGamesFromCache();

  if (gamesAlreadyCached.length > 0) {
    return response.json(gamesAlreadyCached);
  }

  const { data } = await api.get<SteamAPIResponse>(
    "https://simple-api-selection.herokuapp.com/list-games/?title=race"
  );

  const games = data.applist.apps.app.slice(0, 300);

  cache.add("steam-apps", games);

  return response.json(games);
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
  const userHash = request.headers["user-hash"] as string;

  const { rating, game_id: gameId } = request.body;

  if (!userHash) {
    return response.status(400).json({
      message: 'Informe um "user-hash"',
    });
  }

  if (rating < 0 || rating > 5) {
    return response.status(400).json({
      error: 400,
      message: "Escolha uma nota entre 0 e 5",
    });
  }

  const favorite: FavoriteGame = {
    rating,
    game_id: gameId,
    user_hash: userHash,
  };

  const userAlreadyExists = favoritesDatabase.findGamesByUserHash(
    favorite.user_hash
  );

  if (userAlreadyExists) {
    const favoriteGameAlreadyAddedToUser = favoritesDatabase.findByGameId(
      favorite.user_hash,
      favorite.game_id
    );

    if (favoriteGameAlreadyAddedToUser) {
      return response.status(400).json({
        error: 400,
        message: "Ops... Não é possivel adiconar o mesmo jogo duas vezes",
      });
    }
  }

  favoritesDatabase.save(favorite);

  return response.status(201).json(favorite);
});

routes.delete("/favorites/:game_id", (request: Request, response: Response) => {
  const gameId = Number(request.params.game_id);

  const userHash = request.headers["user-hash"] as string;

  if (!userHash) {
    return response.status(409).json({
      message: 'Informe um "user-hash"',
    });
  }

  const userHasAddedFavorites = favoritesDatabase.has(userHash);

  if (!userHasAddedFavorites) {
    return response.status(409).json({
      message: "Este jogo já foi removido dos favoritos pelo usuário",
    });
  }

  const favorite = favoritesDatabase.findByGameId(userHash, gameId);

  if (!favorite) {
    return response.status(409).json({
      message: "Este jogo já foi removido dos favoritos pelo usuário",
    });
  }

  favoritesDatabase.deleteByGameId(userHash, gameId);

  return response.status(200).send();
});

export { routes };
