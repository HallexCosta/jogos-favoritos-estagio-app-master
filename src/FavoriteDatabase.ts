export type FavoriteGame = {
  rating: number;
  game_id: number;
  user_hash: string;
};

export class FavoriteDatabase extends Map<string, FavoriteGame[]> {
  public save(favorite: FavoriteGame) {
    const favorites = this.get(favorite.user_hash);

    if (favorites) {
      this.set(favorite.user_hash, [...favorites, favorite]);
    }

    if (!favorites) {
      this.set(favorite.user_hash, [favorite]);
    }
  }

  public findGamesByUserHash(userHash: string) {
    const games = this.get(userHash);

    return games;
  }

  public findByGameId(userHash: string, gameId: number) {
    const favorites = this.get(userHash);

    return favorites.find((favorite) => favorite.game_id === gameId);
  }

  public deleteByGameId(userHash: string, gameId: number) {
    const favorites = this.get(userHash);

    const temp = [];

    for (const favorite of favorites) {
      if (favorite.game_id !== gameId) {
        temp.push(favorite);
      }
    }

    this.set(userHash, temp);
  }
}
