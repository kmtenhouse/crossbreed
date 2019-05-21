//STARTER PET TEMPLATES
//When starting the game, users can currently receive pets from a selection of pre-defined 'starter' pets 
const Pet = require('../scripts/classes/pet'); 
const blackPet = require('./starterPets/blackPet.json');
const whitePet = require('./starterPets/whitePet.json');

//getRandomStarter

//Takes an OPTIONAL parameter of how many starters to return (default is 2)
//Returns an array with the requested # of pets
function getRandomStarter(numPets = 2) {
    const starterPetEggs = [ blackPet, whitePet];

    if (numPets > starterPetEggs.length || numPets <= 0) {
        throw new Error("Requested an invalid number of starter pets");
    }

    const petResults = [];

    for (let i = 0; i < numPets; i++) {
        let randomIndex = Math.floor(Math.random() * starterPetEggs.length);
        let randomPet = new Pet(starterPetEggs.splice(randomIndex, 1)[0]);
        petResults.push(randomPet);
    }
    return petResults;
}

module.exports = getRandomStarter;