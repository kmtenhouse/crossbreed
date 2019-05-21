const express = require('express');
const router = express.Router();
const User = require('../../db/models/user');
const petController = require('../../controllers/petController');
const userController = require('../../controllers/userController');
const passport = require('../../passport');
const asyncMiddleWare = require('../middleware/async');


router.post(
	'/login',
	function (req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err) { return res.status(500).json(err) }
			if (!user) { return res.status(403).json( { message: info.message }) }
			req.login(user, (err) => {
				if(err){
					return res.status(500).json(err);
				}
				next();
			})
		})(req, res, next)
	},
	userController.findOne
)

router.post('/logout', (req, res) => {
	if (req.user) {
		req.session.destroy()
		res.clearCookie('connect.sid') // clean up!
		return res.json({ msg: 'logging you out' })
	} else {
		return res.json({ msg: 'no user to log out!' })
	}
})

// Route for logging in with Google on the front-end
// Will look for googleId in the database, will create doc if it doesn't exist already
router.post('/login/google', (req, res, next) => {
	console.log("beep" + JSON.stringify(req.body))
	const { id, givenName } = req.body;
	User.findOne({ 'google.googleId': id })
	.populate({path: 'pets', select: '_id name baseColor outlineColor gameColor level experiencePoints' })
    .populate({path: 'eggs', select: '_id createdOn lifeStage willHatchOn' })
    .then((user) => {
		if (!user){
			console.log("no user found");
			return User.create({ "google.googleId": id , "displayName": givenName}, (err, user) => {
				console.log(err);
				console.log(user);
				req.login(user, function(err) { //AP: req.login is available in passport; it's not an express function
    			  if (err) {
					console.log('Hit some error ', err);
					return res.status(307)
    			  } else {
    			    next();
    			  }
    			})
			})
		}
    	//AP: instead of returning user as above, you would instead do:
    	const userObj = {
    	  _id: user._id,
		  displayName: user.displayName,
		  pets: user.pets,
		  eggs: user.eggs
    	}
    	req.login(userObj, function(err) { //AP: req.login is available in passport; it's not an express function
    	  if (err) {
			console.log('Hit some error ', err);
			return res.status(307)
    	  } else {
			console.log(user);
    	    return res.json(user);
    	  }
    	})
		// next(); => AP: Moved next function call above

	})
},

  // passport.authenticate('google'), asyncMiddleWare(petController.createStarterPet)
  // AP: Since we are forcing passport session with req.login, we can skip passport.authenticate here and straight call the createStarterPet function
  asyncMiddleWare(petController.createStarterPet)

)

router.post(
	'/signup',
	function (req, res, next) {
		console.log(req.body)
		console.log('======INCOMING NEW USER==========')
		const { username, password, displayName, email } = req.body
		console.log("REQ.BODY: ", req.body)
		
		//first, always validate anything the user is giving us!!  (That way we can provide the right error messages too ;)
		const alphanumericNoSpaces = /^[a-z0-9]+$/i;
		if(!alphanumericNoSpaces.test(username)) {
			return res.status(400).json({
				message: 'Sorry, your username can only include letters (a-z) and numbers!'
			});
		} 

		const allowedCharsForEmail = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/
		if(!allowedCharsForEmail.test(email)) {
			return res.status(400).json({
				message: 'Please enter a valid email address (in case you forget your password).'
			});
		}

		const alphanumericWithSpaces = /^[a-z0-9\ ]+$/i;
		if(!alphanumericWithSpaces.test(displayName)) {
			return res.status(400).json({
				message: 'Sorry, your display name can only include letters (a-z), spaces, and numbers!'
			});
		}

		var strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
		if(!strongPassword.test(password)) {
			return res.status(400).json({
				message: 'Please select a stronger password.'
			});
		}

		User.findOne({ 'local.username': username.toLowerCase() }, (err, userMatch) => {
			if (userMatch) {
				return res.status(403).json({
					message: `Sorry, the username: "${username}" is already taken`
				})
			}
			const newUser = new User({
				'local.username': username.toLowerCase(), //NOTE: we'll always convert (and save) the username as lowercase so that it's not annoying for the user on the front end
				'local.password': password,
				'local.email':email,
				displayName
			})
			newUser.save((err, savedUser) => {
				if (err) return res.status(500).json(err);
				next();
			})
		})
		console.log("Going to passport");
	},
	passport.authenticate('local'), asyncMiddleWare(petController.createStarterPet)
)

module.exports = router;