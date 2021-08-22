import supertest from "supertest";
import assert from "assert";

import { app } from "../src/app";

const agent = supertest(app);

(async () => {
  console.log("> Run test on routes /favorites");

  // should be able to throw error if rate is less than zero and greater than five
  {
    agent
      .post("/favorites")
      .send({
        rating: 10,
        game_id: 495160,
        login: "hallex",
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

  // user must be able to rate a game from zero to five.
  {
    const body = {
      rating: 5,
      game_id: 495160,
      login: "hallex",
    };

    agent
      .post("/favorites")
      .send(body)
      .then(({ body: favoriteGame }) => {
        assert(favoriteGame.game_id === 495160);
        assert(favoriteGame.grade === 10);
        assert(favoriteGame.user_hash === "e91674638e85ab083536a6fb2b16702c");
      });

    agent
      .post("/favorites")
      .send(body)
      .then(({ body: favoriteGame }) => {
        assert(favoriteGame.game_id === 495160);
        assert(favoriteGame.grade === 10);
        assert(favoriteGame.user_hash === "e91674638e85ab083536a6fb2b16702c");
      });

    console.log("user must be able to rate a game from zero to five", true);
  }

  // should be able to add in memory new favorite game by user hash
  {
    agent
      .post("/favorites")
      .send({
        grade: 10,
        game_id: 495160,
        login: "hallex",
      })
      .then(({ body }) => {
        assert(body.game_id === 495160);
        assert(body.grade === 10);
        assert(body.user_hash === "e91674638e85ab083536a6fb2b16702c");
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
      .set("user-hash", "e91674638e85ab083536a6fb2b16702c")
      .then(({ body }) => {
        assert(body[0].game_id, body[0].gameDetails.steam_appid);
        console.log("should be able to list favorite games by user hash", true);
      });
  }

  // should be able throw error if trying to disfavor a game not added by user hash
  {
    agent
      .delete(`/favorites/495160`)
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
      .delete(`/favorites/495160`)
      .send()
      .set("user-hash", "e91674638e85ab083536a6fb2b16702c")
      .then(({ body }) => {
        assert(body.delete === true);
        assert(body.favorite.game_id === 495160);
        assert(body.favorite.user_hash === "e91674638e85ab083536a6fb2b16702c");
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
      .set("user-hash", "e91674638e85ab083536a6fb2b16702c")
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
