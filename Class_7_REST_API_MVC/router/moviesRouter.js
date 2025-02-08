const express = require("express");
const moviesRouter = express.Router();

const { getAllMovie, getMovie, createMovie, deleteMovie } = require("../controller/movieControllers");


moviesRouter
    .post("/", createMovie)
    .get("/", getAllMovie)
    .get("/:movieId", getMovie)
    .delete("/:movieId", deleteMovie);

module.exports = moviesRouter;