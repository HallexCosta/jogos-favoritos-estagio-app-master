export type Favorite = {
  grade: number;
  gameId: number;
  userHash: string;
};

export class FavoriteDatabase extends Map {
  public save(userHash: string, favorite: Favorite) {
    this.set(userHash, favorite);
  }
}
