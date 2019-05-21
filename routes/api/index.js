
const express = require('express');
const router = express.Router();

const usersRoutes = require("./users");
const petsRoutes = require("./pets");
const eggsRoutes = require("./eggs");
const wordRoutes = require("./words");

//MAIN ROUTES
router.use("/users", usersRoutes);
router.use("/pets", petsRoutes);
router.use("/eggs/", eggsRoutes);
router.use("/words", wordRoutes);

module.exports = router;
