const http = require("http");
const config = require("./config.json");
const User = require("./models/user");
const Movie = require("./models/movie");
const Pref = require("./models/pref");
const sequelize = require("./util/database");
const UserController = require("./controllers/userController");
const MovieController = require("./controllers/movieController");
const PrefController = require("./controllers/prefController");

User.belongsToMany(Movie, { through: Pref });
Movie.belongsToMany(User, { through: Pref });

const server = http.createServer((req, res) => {
  let body = ''
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    let tokens = req.url.split("/");

    if (tokens[1] === "users") {
      const userController = new UserController(req, res, body);
      userController.execute();
    } else if (tokens[1] === "movies") {
      const movieController = new MovieController(req, res, body);
      movieController.execute();
    } else if (tokens[1] === "prefs") {
      // const prefController = new PrefController(req, res, tokens);
    }
  });
});
server.listen(config.port);
