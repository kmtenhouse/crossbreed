const mongoose = require("mongoose");
const dnaCheck = require("../../validators/dnaValidator");

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        validate: {
            validator: function (val) {
                return /([A-Za-z0-9\ ])\w+/.test(val);
            },
            message: "Pet name can only include alphanumeric and space characters"
        },
        trim: true,
        minlength: [1, "Pet must have a name"],
        maxlength: [50, "Max length is fifty characters"],
        required: [true, "Pet must have a name"],
        default: "Unnamed Pet"
    },
    //Note: we are not requiring the user id because later on folks can 'release' pets
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    //Note: 'lastBred' stores the timestamp of the most recent successful breeding
    //We can use that date to determine when the creature is ready to breed again
    lastBred: {
        type: Date,
        default: ""
    },
    isWild: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    level: {
        type: Number,
        default: 1
    },
    experiencePoints: {
        type: Number,
        default: 0
    },
    baseColor: {},
    outlineColor: {},
    gameColor: {},
    ears: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    antennae: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    extraGuesses: {
        type: Number,
        default: 0
    },
    parents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet'
    }],
    children: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Pet'
    }],
    dna: {
        type: mongoose.Schema.Types.Mixed,
 /*        validate: {
            validator: function (val) {
                return dnaCheck.isValidDNA(val);
            }
        } */
    }
});

petSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.dna;
    return obj;
}

const Pet = mongoose.model("Pet", petSchema);
module.exports = Pet;

