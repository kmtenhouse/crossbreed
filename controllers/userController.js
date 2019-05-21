// Main User Controller
// ============================
const db = require('../db/models');

module.exports = {
  //Find (one) user
  //This can be done by anyone, as we are ONLY showing the pets that person has
  //We might use this when a person views their pal's stable (for example)
  findOne: function (req, res) {

    if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
      return res.sendStatus(403);
    }
    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

    db.User.findById(loggedInUser) //never return any other user info!
      .populate({path: 'pets', select: '_id name baseColor outlineColor gameColor level experiencePoints ears antennae extraGuesses' })
      .populate({path: 'eggs', select: '_id createdOn lifeStage willHatchOn' })
      .then(results => res.json(results))
      .catch(err => res.status(500).json(err));
  },

  //==========
  //PROTECTED ROUTES
  //USER MUST BE AUTHENTICATED FOR THESE ACTIONS
  //==========

  // Delete one
  // NOTE: deleting a user should also delete the pets they have on the site
  delete: function (req, res) {
    if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
      return res.sendStatus(403);
    }
    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

    //sanity check if the id doesn't match the route, also reject with forbidden
    if (loggedInUser !== req.params.userId) {
      return res.sendStatus(403);
    }
    //(TO-DO) check if we need to do anything to also delete the pets!!

    db.User.findByIdAndDelete(loggedInUser)
      .then(result => {
        if (!result) {
          return res.sendStatus(404);

        }
        //Kill the logged in session also!
        if (req.user) {
          req.session.destroy()
          res.clearCookie('connect.sid') // clean up!
        }
        return res.json({ deleted: true });
      })
      .catch(err => res.status(500).json(err));
  },

  // Update the specified user
  update: async function (req, res) {

    if (!req.session.passport) { //if there is no session info, user is not logged in!  reject their request
      return res.sendStatus(403);
    }

    const loggedInUser = req.session.passport.user._id; //grab the user's id from the session cookie

    //sanity check if the id doesn't match the route, also reject with forbidden
    if (loggedInUser !== req.params.userId) {
      return res.sendStatus(403);
    }
    //Next, check that the thing the user is trying to do is allowed
    //Things the user is allowed to update themselves: 
    //1) their display name (so long as the new one is unique)
    //2) which pets they have
    if (!req.body.displayName) {
      return res.sendStatus(400);
    }
    //Set the options
    const options = { $set: {} };

    if (req.body.displayName) {
      //check that the new display name would be considered valid first
      const allowedChars = /^[a-z0-9\ ]+$/i;
      if (!allowedChars.test(req.body.displayName)) {
        return res.sendStatus(400); 
      }
      else {
        options.$set['displayName'] = req.body.displayName;
      }
    }

    //finally, update the user, then send the updated user (and their pets) back to the front end
    const updatedUser = await db.User.findOneAndUpdate({ _id: loggedInUser }, options, { new: true, runValidators: true, fields: '_id displayName' });

    res.json(updatedUser);

  }

};
