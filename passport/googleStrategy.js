const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const User = require('../db/models/user')

const strategy = new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: '/auth/google/callback'
	},
	function (token, tokenSecret, profile, done) {
		const { id, name, photos } = profile
		User.findOne({ 'google.googleId': id }, (err, userMatch) => {
			// handle errors here:
			if (err) {
				//(TO-DO) log and open ticket
				return done(null, false)
			}
			// if there is already someone with that googleId
			if (userMatch) {
				return done(null, userMatch)
			} else {
				// if no user in our db, create a new user with that googleId
				const newGoogleUser = new User({
					'google.googleId': id,
					displayName: name.givenName + " " + name.familyName
				})
				// save this user
				newGoogleUser.save((err, savedUser) => {
					if (err) {
						//(TO-DO) log and open ticket
						return done(null, false)
					} else {
						return done(null, savedUser)
					}
				}) // closes newGoogleUser.save
			}
		}) // closes User.findONe
	}
)

module.exports = strategy
