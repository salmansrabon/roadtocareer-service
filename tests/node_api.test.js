const supertest = require("supertest");
const app = require("../app");
const { logger } = require("../utils");

const api = supertest(app);

test("Health", async () => {
  await api
    .get("/health")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("Test", async () => {
  const data = {
    email: "nayeemxtreme@live.com",
    password: "@A123456789",
  };

  const response = await api.post("/signin").send(data);
  expect(response.status).toEqual(200);
  expect(response.body.token).toBeDefined();

  logger.info(response.body.token);
});
