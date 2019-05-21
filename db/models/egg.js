// Egg model
// ==============

// Require mongoose
const mongoose = require("mongoose");

// Create the EggSchema with our schema class
const eggSchema = new mongoose.Schema({
    dna: {},
    parents: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet' 
    }],
    createdOn: { type: Date, default: Date.now, required: [true, 'Egg must have a birthdate'] },
    isStarter: { type: Boolean, default: false},
    duration: { type: Number, default: 120000 },
    lifeStage: { type: String, default: "egg" },
    startIncubate: { type: String },
    willHatchOn: { type: String },
    //Note: we are not requiring the user id because later on folks can 'release' pets
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
});

//Hide the DNA from (almost all) situations
eggSchema.methods.toJSON = function() {
	const obj = this.toObject();
	delete obj.dna;
	return obj;
}

// Create the Egg model using the EggSchema
const Egg = mongoose.model("Egg", eggSchema);

// Export the Egg model
module.exports = Egg;
