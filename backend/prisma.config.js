require("dotenv").config();

module.exports = {
  adapter: {
    type: "postgresql",
    url: process.env.DATABASE_URL,
  },
};
