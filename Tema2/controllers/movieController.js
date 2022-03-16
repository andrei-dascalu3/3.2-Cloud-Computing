const Movie = require("../models/movie");

module.exports = class MovieController {
  getMovies = async () => {
    const data = await Movie.findAll({
      limit: 50,
      where: {},
    });
    return data;
  };
  getMovie = async (mid) => {
    const data = await Movie.findAll({
      limit: 50,
      where: { id: mid },
    });
    return data;
  };
};
