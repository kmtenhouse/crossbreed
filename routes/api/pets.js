const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const petsController = require("../../controllers/petController");

//PROTECTED ROUTES - Pets
//  Accessed via /api/pets/
router.post('/', asyncMiddleware(petsController.createPetFromEgg)); //Create a new pet (by hatching an egg)

//  Accessed via /api/pets/:petId
router.get('/:petId', petsController.findOneByUser); //Get one pet
router.put('/:petId', petsController.update);  //Update one pet
router.delete('/:petId', petsController.delete); //Delete one pet

module.exports = router;