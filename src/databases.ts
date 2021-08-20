export type Favorite = {
  grade: number;
  game_id: number;
  user_hash: string;
};

export class FavoriteDatabase extends Map<string, Favorite[]> {
  public save(userHash: string, favorite: Favorite) {
    const favorites = this.get(userHash);

    if (favorites) {
      this.set(userHash, [...favorites, favorite]);
    }

    if (!favorites) {
      this.set(userHash, [favorite]);
    }
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
