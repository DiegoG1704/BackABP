const app = require("./src/app.js");
const { PORT } = require("./src/config.js");

app.listen(PORT);
console.log('server listening on port', PORT);