const Joi = require('joi');

//This is the definition for what goes in our genes
//Most basic gene is an array of two alleles
//Each allele has a value (0 or 1), and then a boolean that says if it's dominant
const simpleGene = Joi.array().min(2).max(2).items(
    Joi.object()
        .keys(
            {
                value: Joi.number().integer().min(0).max(1),
                isDominant: Joi.boolean()
            }));

//For gene sequences that code for an rgb color, (0-255), we expect a gene for each bit
const rgbColorGeneSequence = Joi.object()
    .keys({
        '1': simpleGene,
        '2': simpleGene,
        '4': simpleGene,
        '8': simpleGene,
        '16': simpleGene,
        '32': simpleGene,
        '64': simpleGene,
        '128': simpleGene
    });

//a complete rgb color set has genes for red, green, and blue
//NOTE: in the future we may also have a gene for transparency
const rgbColorGeneSet = Joi.object().keys({
    red: rgbColorGeneSequence,
    green: rgbColorGeneSequence,
    blue: rgbColorGeneSequence
});

//the final overarching schema!
const dnaSchema = Joi.object().keys({
    baseColor: rgbColorGeneSet
});


module.exports = {
    isValidDNA: function (dnaToTest) {
        return Joi.validate(dnaToTest, dnaSchema, function (err, value) {
            if (!err) {
                return true;
            }
            return false;
        });
    }
};