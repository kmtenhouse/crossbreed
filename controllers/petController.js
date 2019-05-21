const db = require("../db/models");
const getStarterPet = require("../scripts/starterPets");
const Pet = require('../scripts/classes/pet');
const calcLevelAndXP = require("../scripts/levelSystem");

module.exports = {
  //Find one pet (that belongs to a user)
  //Looks up a particular pet
  findOneByUser: function(req, res) {
    if (!req.session.passport) {
      //if there is no session info, user is not logged in!  reject their request
      return res.sendStatus(403);
    }
    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

    db.Pet.findOne({ _id: req.params.petId, user: loggedInUser }, { dna: 0 }) //return everything except the dna
      .populate({ path: "parents", select: "_id name" })
      .populate({ path: "children", select: "_id name" })
      .then(result => res.json(result))
      .catch(err => res.sendStatus(500));
  },

  //PROTECTED METHODS
  //CREATE METHODS
  //Note: there are two valid ways to create a pet:
  //1) from hatching an egg
  //2) creating an adult 'starter' pet when a new user is first created
  createPetFromEgg: async function(req, res) {
    if (!req.session.passport) {
      //if there is no session info, user is not logged in!  reject their request
      return res.sendStatus(403);
    }
    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

    //Expects the _id of an egg to hatch from the body of the request
    if (!req.body._id) {
      return res.json(400);
    }

    //First, look up the egg
    //(TO-DO) Validate that it has incubated long enough to hatch
    const eggData = await db.Egg.findOne({
      _id: req.body._id,
      user: loggedInUser,
      lifeStage: "readyToHatch"
    }).lean(true);
    if (!eggData) {
      return res.sendStatus(404);
    }

    //create a new pet from the egg (and set it to belong to the user)
    const newPet = new Pet(eggData);
    newPet["user"] = loggedInUser;

    //now, delete the egg...and save our hatched pet!
    //(TO-DO) delete the eggs' id from the user also
    const results = await Promise.all([
      db.Egg.findByIdAndDelete(eggData._id),
      db.Pet.create(newPet)
    ]);

    //push the hatched pet to the user's array of eggs...
    const hatchedPet = results[1];
    await Promise.all([
      db.Pet.findByIdAndUpdate(hatchedPet.parents[0], {
        $push: { children: hatchedPet._id }
      }),
      db.Pet.findByIdAndUpdate(hatchedPet.parents[1], {
        $push: { children: hatchedPet._id }
      }),
      db.User.findByIdAndUpdate(loggedInUser, {
        $push: { pets: hatchedPet._id },
        $pull: { eggs: eggData._id }
      })
    ]);

    //though we return only the new pet (minus the dna) to the front end
    res.json(hatchedPet);
  },

  createStarterPet: async function (req, res) {
    console.log("Trying to create a starter pet");
    if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
    // AP: Rather than using req.session.passport, I would suggest using req.user which is a more better way of accessing current logged user
    // AP: In any case, if you are able to use req.login as given in the previous function, passport should create a session for the google user and thereby making passing the authentication tests in this function
        console.log("Not logged in");
        return res.sendStatus(403);
    }
    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie
  
    //grab two random starter pets from the template and add which user it belongs to
    const randomPets = getStarterPet(2);
    randomPets[0]['user'] = loggedInUser;
    randomPets[1]['user'] = loggedInUser;

    //save the pets to the db 
    const dbSavedPets = await db.Pet.create(randomPets);

    //finally, continue updating the user model with the pets
    const updatedUserResult = await db.User.findByIdAndUpdate(loggedInUser, {
        $push: { pets: { $each: [dbSavedPets[0]._id, dbSavedPets[1]._id] } }
    }, { new: true })
        .populate('pets', { dna: 0 })
        .populate('eggs', { dna: 0 });

    res.json(updatedUserResult);
  },

  // Delete one pet (belonging to a particular user)
  delete: function(req, res) {
    if (!req.session.passport) {
      //if there is no session info, user is not logged in!  reject their request
      return res.sendStatus(403);
    }
    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

    db.Pet.deleteOne({ _id: req.params.petId, user: loggedInUser })
      .then(result => res.json(result))
      .catch(err => res.status(500).json(err));
  },

  // Update the specified pet (belonging to a particular user)
  // Valid attributes to update at present are isFavorite, pet name, and level/xp/gainedxp
  update: function(req, res) {
    if (!req.session.passport) {
      //if there is no session info, user is not logged in!  reject their request
      return res.sendStatus(403);
    }
    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

    //Check what we passed in -- if we didn't set at least one of the possible options, reject as malformed
    if (
      !req.body.isFavorite &&
      !req.body.name &&
      !req.body.currentLevel &&
      !req.body.currentXP &&
      !req.body.gainedXP
    ) {
      return res.sendStatus(400);
    }

    //Now we populate our options based on what we received in the req.body
    const options = { $set: {} };

    //Check if we are updating isFavorite
    if (req.body.isFavorite !== undefined) {
      options.$set["isFavorite"] = req.body.isFavorite;
    }

    //Check if we updating the name
    if (req.body.name) {
      options.$set["name"] = req.body.name;
    }

    // Check that we have all the necessary variables to calculate level and XP; if not, don't adjust those
    if (
      req.body.currentLevel !== undefined &&
      req.body.currentXP !== undefined &&
      req.body.gainedXP !== undefined
    ) {
      const currentLevel = parseInt(req.body.currentLevel);
      const currentXP = parseInt(req.body.currentXP);
      const gainedXP = parseInt(req.body.gainedXP);
      //if you send garbage in for the level data, reject as a malformed request
      if (isNaN(currentLevel) || isNaN(currentXP) || isNaN(gainedXP)) {
        return res.sendStatus(400);
      }
      const { newLevel, newXP } = calcLevelAndXP(
        currentLevel,
        currentXP,
        gainedXP
      );
      options.$set["level"] = newLevel;
      options.$set["experiencePoints"] = newXP;
    }

    // Update pet and return the new pet stats (if anything did update successfully)
    db.Pet.findOneAndUpdate(
      { _id: req.params.petId, user: loggedInUser },
      options,
      { new: true, fields: { dna: 0 } }
    )
      .populate({ path: "parents", select: "_id name" })
      .populate({ path: "children", select: "_id name" })
      .then(result => res.json(result))
      .catch(err => res.status(500).json(err));
  }
};
