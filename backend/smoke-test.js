const http = require("http");
const axios = require("axios");
const app = require("./dist/app").default;

const port = 4001;
const server = http.createServer(app);

async function run() {
  server.listen(port);

  const email = `demo-${Date.now()}@rarsshield.com`;
  const password = "DemoPass123!";

  const signup = await axios.post(`http://localhost:${port}/api/auth/signup`, {
    email,
    password,
    name: "Demo User",
  });

  const login = await axios.post(`http://localhost:${port}/api/auth/login`, {
    email,
    password,
  });

  const token = login.data.data.accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const onboard = await axios.post(
    `http://localhost:${port}/api/wallet/onboard`,
    {
      email,
      firstName: "Demo",
      lastName: "User",
      countryCode: "NG",
      createSmartWallet: false,
    },
    { headers },
  );

  const analysis = await axios.post(
    `http://localhost:${port}/api/analysis`,
    {
      type: "TEXT",
      payload:
        "I received a message asking me to send money to a supposed government office to unlock my account.",
    },
    { headers },
  );

  const insights = await axios.post(
    `http://localhost:${port}/api/financial-insights/sync`,
    {},
    { headers },
  );

  console.log(
    JSON.stringify(
      {
        signup: signup.data,
        login: login.data,
        onboard: onboard.data,
        analysis: analysis.data,
        insights: insights.data,
      },
      null,
      2,
    ),
  );
}

run()
  .catch((error) => {
    if (error.response) {
      console.error("HTTP error", error.response.status, error.response.data);
    } else {
      console.error("Error", error.message);
    }
    process.exit(1);
  })
  .finally(() => {
    server.close();
  });
