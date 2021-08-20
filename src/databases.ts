export type Favorite = {
  grade: number;
  game_id: number;
  user_hash: string;
};

export class Databases {
  public favoritesDatabase: Favorite[] = [];
}
