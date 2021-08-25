import supertest from "supertest";
import assert from "assert";

import { app } from "../src/app";

const agent = supertest(app);

(async () => {
  console.log("> Run test on routes /");

  // should be able list all apps from steam api
  {
    agent
      .get("/")
      .send()
      .then(({ body: apps }) => {
        assert(apps[0].hasOwnProperty("appid"));
        assert(apps[0].hasOwnProperty("name"));
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
