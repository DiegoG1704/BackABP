const { config } = require("dotenv");

config();

// module.exports = {
//   PORT: process.env.PORT || 4000,
//   DB_USER: process.env.DB_USER || "root",
//   DB_HOST: process.env.DB_HOST || "localhost",
//   DB_PASSWORD: process.env.DB_PASSWORD || "",
//   DB_DATABASE: process.env.DB_DATABASE || "formulario",
// };

module.exports = {
  PORT: 4000,
  DB_USER: "root",
  DB_HOST:"localhost",
  DB_PASSWORD: "",
  DB_DATABASE: "formulario",
};