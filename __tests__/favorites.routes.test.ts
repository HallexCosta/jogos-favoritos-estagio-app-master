import supertest from "supertest";
import assert from "assert";

import { app } from "../src/app";

const agent = supertest(app);

(async () => {
  console.log("> Run test on routes /favorites");

  const fakeFavoriteGame = {
    rating: 5,
    game_id: 495160,
    login: "hallex",
  };

  const fakeUserHash = "e91674638e85ab083536a6fb2b16702c";

  // should be able to throw error if rate is less than zero and greater than five
  {
    agent
      .post("/favorites")
      .send({
        ...fakeFavoriteGame,
        rating: 10,
      })
      .expect(400)
      .end((error) => {
        if (error) throw error;

        console.log(
          "should be able to throw error if rate is less than zero and greater than five",
          true
        );
      });
  }

  // should be able allow user to rate a game from zero to five.
  {
    agent
      .post("/favorites")
      .send({ ...fakeFavoriteGame, rating: 0 })
      .then(({ body: favoriteGame }) => {
        assert(favoriteGame.game_id === 495160);
        assert(favoriteGame.rating === 0);
        assert(favoriteGame.user_hash === fakeUserHash);
      });

    agent
      .post("/favorites")
      .send({ ...fakeFavoriteGame, rating: 5 })
      .then(({ body: favoriteGame }) => {
        assert(favoriteGame.game_id === fakeFavoriteGame.game_id);
        assert(favoriteGame.rating === fakeFavoriteGame.rating);
        assert(favoriteGame.user_hash === fakeUserHash);
      });

    console.log(
      "should be able allow user to rate a game from zero to five.",
      true
    );
  }

  // should be able to add in memory new favorite game by user hash
  {
    agent
      .post("/favorites")
      .send(fakeFavoriteGame)
      .then(({ body: favoriteGame }) => {
        assert(favoriteGame.game_id === fakeFavoriteGame.game_id);
        assert(favoriteGame.rating === fakeFavoriteGame.rating);
        assert(favoriteGame.user_hash === fakeUserHash);
        console.log(
          "should be able to add in memory new favorite game by user hash",
          true
        );
      });
  }

  // should be able to list favorite games by user hash
  {
    agent
      .get("/favorites")
      .send()
      .set("user-hash", fakeUserHash)
      .then(({ body: [favoriteGame] }) => {
        assert(favoriteGame.game_id, favoriteGame.gameDetails.steam_appid);
        console.log("should be able to list favorite games by user hash", true);
      });
  }

  // should be able throw error if trying to disfavor a game not added by user hash
  {
    agent
      .delete(`/favorites/${fakeFavoriteGame.game_id}`)
      .set("user-hash", "FAKE USER HASH")
      .expect(400)
      .end((error) => {
        if (error) throw error;

        console.log(
          "should be able throw error if trying to disfavor a game not added by user hash",
          true
        );
      });
  }

  // should be able to delete a favorite game by id from user hash
  {
    agent
      .delete(`/favorites/${fakeFavoriteGame.game_id}`)
      .send()
      .set("user-hash", fakeUserHash)
      .then(({ body }) => {
        assert(body.delete === true);
        assert(body.favorite.game_id === fakeFavoriteGame.game_id);
        assert(body.favorite.user_hash === fakeUserHash);
        console.log(
          "should be able to delete a favorite game by id from user hash",
          true
        );
      });
  }

  // should be able to throw error if user hash not have none game added
  {
    agent
      .get(`/favorites`)
      .set("user-hash", fakeUserHash)
      .expect(400)
      .end((error) => {
        if (error) throw error;

        console.log(
          "should be able to throw error if user hash not have none game added",
          true
        );
      });
  }
})();
