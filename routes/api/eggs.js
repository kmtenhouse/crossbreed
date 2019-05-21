const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const eggsController = require("../../controllers/eggController");

//PROTECTED ROUTES - Eggs
router.post('/', asyncMiddleware(eggsController.createEggFromTwoParents)); //Create a new egg (by breeding)
router.get("/:eggId", eggsController.findOneByUser); //Get one egg
router.put('/:eggId', eggsController.update); //Update one egg
router.delete('/:eggId', eggsController.delete); //Delete one egg

module.exports = router;