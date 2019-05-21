const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
mongoose.promise = Promise

// Define userSchema
const userSchema = new Schema({
  displayName: { type: String, required: true },
  local: { //if using username/password
		username: { type: String, unique: true, required: false, sparse: true },
		password: { type: String, unique: false, required: false },
		email:{ type: String, unique: true, required: false, sparse: true },
		resetPasswordToken: String,
		resetPasswordExpires: Date,
  },
  google: { //if using google auth
	  googleId: { type: String, unique: true, sparse: true, required: false }
	},
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  eggs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Egg' }],
})

// Define schema methods
userSchema.methods = {
	checkPassword: function(inputPassword) {
		return bcrypt.compareSync(inputPassword, this.local.password)
	},
	hashPassword: plainTextPassword => {
		return bcrypt.hashSync(plainTextPassword, 10)
	}
}

// Define hooks for pre-saving
userSchema.pre('save', function(next) {
	if (!this.local.password) {
		console.log('=======NO PASSWORD PROVIDED=======')
		next()
	} else {
		this.local.password = this.hashPassword(this.local.password)
		next()
	}
	// this.password = this.hashPassword(this.password)
	// next()
})

userSchema.methods.toJSON = function() {
	const obj = this.toObject();
	delete obj.local;
	delete obj.google;
	return obj;
}

// Create reference to User & export
const User = mongoose.model('User', userSchema)
module.exports = User
