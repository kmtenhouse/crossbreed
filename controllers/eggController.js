const db = require("../db/models");
const Egg = require("../scripts/classes/egg");
const moment = require("moment");

module.exports = {

    //Find one egg by user: 
    findOneByUser: function (req, res) {

        if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
            return res.sendStatus(403);
        }
        const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

        db.Egg.findOne({ _id: req.params.eggId, user: loggedInUser }, { dna: 0 }) //return everything except the dna
            .populate({ path: 'parents', select: '_id name' })
            .then(result => {
                if (!result) {
                    return res.sendStatus(404);
                }
                return res.json(result)
            })
            .catch(err => res.sendStatus(500));
    },

    //PROTECTED ACTIONS
    //Users must be logged in to do these actions
    //Create an egg (from two parents)
    createEggFromTwoParents: async function (req, res) {
        //EXPECTS the following in the body:
        //1) user object which has a _id for the logged in user
        //2) keys 'firstParent' and 'secondParent', holding obj id of the two pets to breed
        //If both parents can breed, do so, update their 'lastBred' timestamp, then save the new child to the db
        if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
            return res.sendStatus(403);
        }
        const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

        //make sure we have at least two distinct parent IDs
        if ((!req.body.firstParent && !req.body.secondParent) || (req.body.firstParent === req.body.secondParent)) {
            return res.sendStatus(400);
        }

        //(TO-DO) Add the logic that prevents an egg from being created if the parents were last bred too recently
        //Note: we may be able to refactor so that it automatically updates the lastBred if indeed both parents are eligible to breed at this time?
        const dbFirstParent = await db.Pet.findOne({ _id: req.body.firstParent, user: loggedInUser }, ['_id', 'dna']).lean(true);
        const dbSecondParent = await db.Pet.findOne({ _id: req.body.secondParent, user: loggedInUser }, ['_id', 'dna']).lean(true);

        //Make sure we actually got valid parent results
        if (!dbFirstParent || !dbSecondParent) {
            return res.sendStatus(404);
        }

        //Finally!  We can create an egg :)
        let newEgg = {};
        try {
            newEgg = new Egg(dbFirstParent, dbSecondParent);
        }
        catch (err) {
            return res.sendStatus(500); 
        }
        //now we save the child to the db under this user's name 
        //and update the parents to show they have recently bred
        newEgg['user'] = loggedInUser;

        const results = await Promise.all([
            db.Pet.updateOne({ _id: dbFirstParent._id, user: loggedInUser }, { $set: { lastBred: Date.now() } }),
            db.Pet.updateOne({ _id: dbSecondParent._id, user: loggedInUser }, { $set: { lastBred: Date.now() } }),
            db.Egg.create(newEgg)]);

        //only send the egg back to the front end -- after removing the dna
        const dbSavedEgg = results[2];

        //lastly, update the user's array of egg objects
        const updatedUserResult = await db.User.findByIdAndUpdate(loggedInUser, {
            $push: { eggs: { $each: [dbSavedEgg._id] } }
        }, { new: true });

        res.json(dbSavedEgg);
    },

    // Delete an egg
    delete: function (req, res) {
        if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
            return res.sendStatus(403);
        }
        const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

        db.Egg.deleteOne({ _id: req.params.eggId, user: loggedInUser })
            .then(result => res.json(result))
            .catch(err => res.sendStatus(500));
    },
    // Update the specified egg (belonging to a user)
    update: function (req, res) {
        if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
            return res.sendStatus(403);
        }
        const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

        //NOTE: at this time the only things we can change are the lifeStage and countdown timers
        //TO-DO add the count-down timer!
        if (!typeof (req.body.lifeStage) === "string") {
            return res.sendStatus(400);
        }
        //TO-DO: also add a check to make sure the user has stable space to be hatching this egg!

        //Customize our options based on what we let the user set
        const options = { $set: {} };

        if (req.body.lifeStage) {
            options.$set["lifeStage"] = req.body.lifeStage;
        }

        if (req.body.startIncubate && req.body.duration) {
            options.$set["startIncubate"] = req.body.startIncubate;
            options.$set["willHatchOn"] = moment(req.body.startIncubate, "x").add(req.body.duration, "milliseconds");
        }

        // Update pet and return the new egg
        db.Egg.findOneAndUpdate({ _id: req.params.eggId, user: loggedInUser }, options, { new: true, fields: { dna: 0 } })
            .populate({ path: 'parents', select: '_id name' })
            .then(result => res.json(result))
            .catch(err => res.sendStatus(500));
    }
};
