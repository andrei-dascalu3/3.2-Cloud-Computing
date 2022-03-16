const Movie = require("../models/movie");

module.exports = class MovieController {
  constructor(req, res, body) {
    this.req = req;
    this.res = res;
    this.body = body;
  }
  getMovies = async (page = 1) => {
    const PAGE_SIZE = 10;
    const skip = (page - 1) * PAGE_SIZE;
    const data = await Movie.findAll({
      limit: PAGE_SIZE,
      offset: skip,
      where: {},
    });
    if (data.length > 0) {
      this.res.writeHeader(200, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } else {
      let data = { message: "Page index out of bound!" };
      this.res.writeHeader(404, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  getMovie = async (uid) => {
    const data = await Movie.findAll({
      where: { id: uid },
    });
    if (data.length === 1) {
      this.res.writeHeader(200, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data[0]));
      this.res.end();
    } else {
      let data = { message: "Movie not found!" };
      this.res.writeHeader(404, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  createMovie = async () => {
    try {
      let movie = JSON.parse(this.body);
      const data = await Movie.create({
        name: movie.name,
        rating: movie.rating,
        genre: movie.genre,
        year: movie.year,
        director: movie.director,
        country: movie.country,
      });
      this.res.writeHeader(201, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } catch (error) {
      this.res.writeHeader(409, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(error));
      this.res.end();
    }
  };

  createMovies = async () => {
    let movies = JSON.parse(this.body);
    let flag = true;
    let res = [{ message: "The following movies already exist." }, []];
    for (let movie of movies) {
      const data = await Movie.findAll({
        where: {
          name: movie.name,
          rating: movie.rating,
          genre: movie.genre,
          year: movie.year,
          director: movie.director,
          country: movie.country,
        },
      });
      if (data.length !== 0) {
        flag = false;
        res[1].push(movie);
      }
    }
    if (flag) {
      movies.forEach(async (movie) => {
        const data = await Movie.create({
          name: movie.name,
          rating: movie.rating,
          genre: movie.genre,
          year: movie.year,
          director: movie.director,
          country: movie.country,
        });
      });
      let data = { message: "Movies added." };
      this.res.writeHeader(201, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } else {
      this.res.writeHeader(409, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(res));
      this.res.end();
    }
  };

  deleteMovies = async () => {
    const data = await Movie.findAll({
      where: {},
    });
    if (data.length === 0) {
      let res = { message: "All movies deleted", number_deleted: data.length };
      this.res.writeHeader(204, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(res));
      this.res.end();
    } else {
      await Movie.destroy({
        where: {},
        truncate: true,
      });
      let res = { message: "All movies deleted", number_deleted: data.length };
      this.res.writeHeader(200, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(res));
      this.res.end();
    }
  };

  deleteMovie = async (uid) => {
    const data = await Movie.findAll({
      where: { id: uid },
    });
    if (data.length === 1) {
      let res = [{ message: "Movie deleted" }];
      await Movie.destroy({
        where: { id: uid },
      });
      this.res.writeHeader(200, { "Content-Type": "text/html" });
      res.push(data[0]);
      this.res.write(JSON.stringify(res));
      this.res.end();
    } else {
      let data = { message: "Movie not found!" };
      this.res.writeHeader(404, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  updateMovies = async () => {
    let movies = JSON.parse(this.body);
    await Movie.destroy({
      where: {},
      truncate: true,
    });
    try {
      movies.forEach(async (movie) => {
        const data = await Movie.create({
          name: movie.name,
          rating: movie.rating,
          genre: movie.genre,
          year: movie.year,
          director: movie.director,
          country: movie.country,
        });
      });
      let data = { message: "All collection updated." };
      this.res.writeHeader(201, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } catch (error) {
      let data = { message: "Error at collection update!" };
      this.res.writeHeader(500, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  updateMovie = async () => {
    try {
      let movie = JSON.parse(this.body);
      let data = await Movie.findAll({ where: { id: movie.id } });
      if (data.length === 0) {
        let result = [{ message: "Movie id does not exist!" }];
        result.push(movie);
        this.res.writeHeader(200, { "Content-Type": "text/html" });
        this.res.write(JSON.stringify(result));
        this.res.end();
      } else {
        data = await Movie.update(
          {
            id: movie.id,
            name: movie.name,
            rating: movie.rating,
            genre: movie.genre,
            year: movie.year,
            director: movie.director,
            country: movie.country,
          },
          { where: { id: movie.id } }
        );
        let result = [{ message: "Movie updated" }];
        result.push(movie);
        this.res.writeHeader(200, { "Content-Type": "text/html" });
        this.res.write(JSON.stringify(result));
        this.res.end();
      }
    } catch (error) {
      this.res.writeHeader(500, { "Content-Type": "text/html" });
      this.res.write(JSON.stringify(error));
      this.res.end();
    }
  };

  execute() {
    const tokens = this.req.url.split("/");
    // GET
    if (this.req.method === "GET") {
      if (tokens.length === 3) {
        const page = Number(tokens[2]);
        if (!isNaN(page)) {
          this.getMovies(page);
        } else {
          this.res.writeHeader(404, { "Content-Type": "text/html" });
          this.res.end();
        }
      } else if (tokens.length === 4 && tokens[2] === "movie") {
        const uid = Number(tokens[3]);
        if (!isNaN(uid)) {
          this.getMovie(uid);
        } else {
          this.res.writeHeader(404, { "Content-Type": "text/html" });
          this.res.end();
        }
      } else {
        this.res.writeHeader(404, { "Content-Type": "text/html" });
        this.res.end();
      }
    }
    // POST
    else if (this.req.method === "POST") {
      if (tokens.length === 2) {
        this.createMovies();
      } else if (tokens.length === 3 && tokens[2] === "movie") {
        this.createMovie();
      } else {
        this.res.writeHeader(404, { "Content-Type": "text/html" });
        this.res.end();
      }
    }
    // PUT
    else if (this.req.method === "PUT") {
      if (tokens.length === 2) {
        this.updateMovies();
      } else if (tokens.length === 3 && tokens[2] === "movie") {
        this.updateMovie();
      } else {
        this.res.writeHeader(404, { "Content-Type": "text/html" });
        this.res.end();
      }
    }
    // DELETE
    else if (this.req.method === "DELETE") {
      if (tokens.length === 2) {
        this.deleteMovies();
      } else if (tokens.length === 4 && tokens[2] === "movie") {
        const uid = Number(tokens[3]);
        if (!isNaN(uid)) {
          this.deleteMovie(uid);
        } else {
          this.res.writeHeader(404, { "Content-Type": "text/html" });
          this.res.end();
        }
      } else {
        this.res.writeHeader(404, { "Content-Type": "text/html" });
        this.res.end();
      }
    }
    else{
      this.res.writeHeader(405, { "Content-Type": "text/html" });
      this.res.end();
    }
  }
};
