import supertest from "supertest";
import assert from "assert";

import { app } from "../src/app";

const agent = supertest(app);

(async () => {
  console.log("> Run test on routes /");

  // should be able throw error if not inform title
  {
    agent
      .get("/")
      .expect(400)
      .end(function (error) {
        if (error) throw error;
      });
  }

  // should be able list all apps from steam api
  {
    agent
      .get("/?title=naruto storm 4")
      .send()
      .then(({ body: appDetais }) => {
        assert(appDetais.length === 2);
        assert(appDetais[0].appid === 495160);
        console.log("should be able list all apps from steam api", true);
      });
  }

  // should be able list one app by appid from steam api
  {
    agent
      .get("/10")
      .send()
      .then(({ body: appDetais }) => {
        assert(appDetais.steam_appid === 10);
        assert(appDetais.type === "game");
        assert(appDetais.name === "Counter-Strike");
        console.log(
          "should be able list one app by appid from steam api",
          true
        );
      });
  }
})();
