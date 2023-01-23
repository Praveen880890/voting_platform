const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

function getCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login = async (agent, username, password) => {
    let res = await agent.get("/login");
    let csrfToken = getCsrfToken(res);
    res = await agent.post("/session").send({
      email: username,
      password: password,
      _csrf: csrfToken,
    });
  };
describe("Online voting platform", function () {
    beforeAll(async () => {
      await db.sequelize.sync({ force: true });
      server = app.listen(4040, () => {});
      agent = request.agent(server);
    });
  
    afterAll(async () => {
      try {
        await db.sequelize.close();
        await server.close();
      } catch (error) {
        console.log(error);
      }
    });
test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = getCsrfToken(res);
    res = await agent.post("/admin").send({
      firstName: "praveen",
      lastName: "rao",
      email: "rao@gmail.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });
test("Sign in", async () => {
    const agent = request.agent(server);
    let res = await agent.get("/election");
    expect(res.statusCode).toBe(302);
    await login(agent, "rao@gmail.com", "12345678");
    res = await agent.get("/election");
    expect(res.statusCode).toBe(200);
});
test("Sign out", async () => {
    let res = await agent.get("/election");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/election");
    expect(res.statusCode).toBe(302);
});
test("Creating a New Election", async () => {
    const agent = request.agent(server);
    await login(agent, "rao@gmail.com", "12345678");
    const res = await agent.get("/election/createNew");
    const csrfToken = getCsrfToken(res);
    const response = await agent.post("/election").send({
      elecName: "who the cm",
      cstmUrl: "jagan",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
});
test("Adding a new question to the created election", async () => {
    const agent = request.agent(server);
    await login(agent, "rao@gmail.com", "12345678");
    let res = await agent.get("/election/create");
    let csrfToken = getCsrfToken(res);
    await agent.post("/election").send({
        elecName: "who is the cr",
        cstmUrl: "ramu",
      _csrf: csrfToken,
    });
    const groupedElectionsResponse = await agent
      .get("/election")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedElectionsResponse.text);
    const electionCount = parsedGroupedResponse.elections.length;
    const latestElection = parsedGroupedResponse.elections[electionCount - 1];
    res = await agent.get(`/election/${latestElection.id}/questions/create`);
    csrfToken = getCsrfToken(res);
    let response = await agent
      .post(`/election/${latestElection.id}/questions/create`)
      .send({
        question: "what is a apple",
        description: "it is a fruit",
        _csrf: csrfToken,
      });
    expect(response.statusCode).toBe(302);
});
});