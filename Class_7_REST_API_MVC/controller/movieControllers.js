const MovieModel = require("../model/movieModel");

const createMovie = async function (req, res) {
  try {
    const movieObject = req.body;
    const movie = await MovieModel.create(movieObject);
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
      error: err,
    });
  }
};

const getMovie = async (req, res) => {
  try {
    const id = req.params.movieId;
    const movie = await MovieModel.findById(id);
    if (movie) {
      res.status(200).json({
        message: movie,
      });
    } else {
      res.status(404).json({
        message: "user not found",
        message: err.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
    });
  }
};

const getAllMovie = async (req, res) => {
  try {
    const movie = await MovieModel.find();
    // if user is present -> send the resp
    if (movie.length != 0) {
      res.status(200).json({
        message: movie,
      });
    } else {
      res.status(404).json({
        message: "did not found any user",
        message: err.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
    });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const id = req.params.movieId;
    const movie = await MovieModel.findByIdAndDelete(id);
    if (movie) {
      res.status(200).json({
        message: "movie deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "movie not found",
        message: err.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
    });
  }
};


module.exports = {
  createMovie: createMovie,
  getMovie: getMovie,
  getAllMovie: getAllMovie,
  deleteMovie: deleteMovie,
};
