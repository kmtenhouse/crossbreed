class Pet {
    //The pet constructor takes in an egg and tries to interprets dna into a pet!
    constructor(egg) {
        this.dna = egg.dna;
        this.parents = egg.parents;

        //PHENOTYPE INTERPRETATION 
        //(the real grubloaf and tubers)
        //Go through the dna's control genepairs and figure out which ones are dominant
        const controlGenes = this.dna.controlGenes
            .map(genePair => this.determineDominance(genePair));

        //Next, try to execute the methods associated with each control gene
        controlGenes.forEach(geneToExpress => {
            if (geneToExpress !== null) {
                const { rnaMethod, phenotypeKeyName, isCritical } = geneToExpress;
                if (phenotypeKeyName !== null && rnaMethod !== null) {
                    this[phenotypeKeyName] = this[rnaMethod](geneToExpress);
                    //Always validate that the creature we have is viable -
                    //if this gene is critical but we didn't get a phenotype, egg cannot hatch
                    if (isCritical === true && this[phenotypeKeyName] === null) {
                        throw new Error("Nonviable pet - missing " + phenotypeKeyName);
                    }
                }
            }
        });


        //TO-DO: add in Joi for better validation
        if (this.baseColor === undefined || this.outlineColor === undefined || this.gameColor === undefined || !this.hasOwnProperty('baseColor') || !this.hasOwnProperty('outlineColor') || !this.hasOwnProperty('gameColor')) {
            throw new Error("Nonviable pet");
        }

    }

    //APPEARANCE RELATED GENES
    determineEars(controlGene) {
        //INPUT: a controlgene
        //OUTPUT: either null (for no ears) or an object with ear type, and color for inner ear 
        //ear genes assume that there is an integer which maps to an ear phenotype

        const possibleEarTypes = {
            '1': 'basic'
        }

        const whichEar = this.determineInteger(controlGene);

        if(whichEar===null || !possibleEarTypes.hasOwnProperty(whichEar)) {
            return null;
        }

        const result = {
            type: possibleEarTypes[whichEar.toString()]
        }
        //next, if there's an inner ear color referenced by genes, grab that
        const innerEarColor = this.resolveSingleReference(controlGene);

        if (innerEarColor !== null) {
            result['innerEarColor'] = innerEarColor;
        }
        else { //otherwise our default is the same color as the blush
            result['innerEarColor'] = {
                red: 253,
                green: 153,
                blue: 199,
                transparency: 255
            };
        }
        //finally, return the result
        return result;
    }

    determineAntennae(controlGene) {
        //INPUT: a controlgene
        //OUTPUT: either null (for total failure) or an object with antennae type
        const possibleAntennaeTypes = {
            '3': 'basic'
        }

        const whichAntennae = this.determineInteger(controlGene);

        
        if(whichAntennae===null || !possibleAntennaeTypes.hasOwnProperty(whichAntennae)) {
            return null;
        }

        const result = {
            type: possibleAntennaeTypes[whichAntennae.toString()]
        }

        return result;
    }

    //COLOR RELATED GENES
    determineRGBA(controlGene) {
        //INPUT: a control gene 
        //OUTPUT: an rgba color object in the format { red: 255, green: 255, blue: 255, transparency: 255}

        //IF we do not have valid info -- ex, the startIndex doesn't fit within the bounds of the dna sequence, or the length of the sequence is <1, we should return a null
        //that is a NONVIABLE color
        const { startIndex, numGenesToExpress } = controlGene;

        const dnaLength = this.dna.sequence.length;
        if (startIndex < 0 || startIndex >= dnaLength || numGenesToExpress < 1
            || (startIndex + numGenesToExpress - 1) >= dnaLength) {
            return null;
        }

        //(TO-DO) add genes to interpret the ORDER the bits get set
        //FOR NOW: it always goes red, green, blue
        const orderToEvaluate = ["red", "green", "blue"];

        //Extract the portion of the dna that encodes for the colors
        const colorGenes = this.dna.sequence
            .slice(startIndex, startIndex + numGenesToExpress)
            .map(allelePair => this.determineDominance(allelePair));

        //Our default is an ABSENCE of color 
        const result = {
            red: 0,
            green: 0,
            blue: 0,
            transparency: 255
        };

        //Run through adding powers of two to the result
        let colorIndex = 0;
        const bits = [1, 2, 4, 8, 16, 32, 64, 128];
        let bit = 0;

        for (let i = 0; i < colorGenes.length && colorIndex < 3; i++) {
            let color = orderToEvaluate[colorIndex];
            result[color] += (colorGenes[i].value === 1 ? bits[bit] : 0);
            bit++;
            if (bit > 7) { //(TO-DO: think about buffer overflows)
                bit = 0;
                colorIndex += 1;
            }
        }

        return result;
    }

    determineContrast(controlGene) {
        //This looks at an existing color and determines if a constrast color should be black or white 

        const color = this.resolveSingleReference(controlGene);
        if (!color) {
            return null;
        }

        //The below algorithm comes from the w3c standard for accessibility 
        //First, we convert the rgb value for each color into its contrast value 
        const contrasts = [color.red, color.green, color.blue].map(currentColor => {
            let currentContrast = currentColor / 255.0;
            if (currentContrast <= 0.03928) {
                currentContrast = currentContrast / 12.92;
            }
            else {
                currentContrast = Math.pow(((currentContrast + 0.055) / 1.055), 2.4);
            }
            return currentContrast;
        });

        //now we use that contrast to calculate an overall luminosity:
        const luminosity = 0.2126 * contrasts[0] + 0.7152 * contrasts[1] + 0.0722 * contrasts[2];
        if (luminosity > 0.179) {
            //if the luminosity is bright, use black as contrast
            return {
                red: 0,
                green: 0,
                blue: 0,
                transparency: 255
            };
        }
        else { //otherwise, use white as a contrast
            return {
                red: 255,
                green: 255,
                blue: 255,
                transparency: 255
            };
        }
    }

    //determineGameColor
    //INPUT: takes a control gene with a reference to the color we should use to determine game color
    //OUTPUT: an object containing the primary and secondary 'effective colors' that we use in minigames  (ex: { primary: "black", secondary: "white"})
    determineGameColor(controlGene) {
        const rgbColor = this.resolveSingleReference(controlGene);
        if (!rgbColor) {
            return null;
        }

        const { red, green, blue } = rgbColor;
        //First, we attack the low hanging fruit -- 'pure' colors
        //If all RGB are 32 or under?  BLACK/BLACK
        if (red <= 32 && green <= 32 && blue <= 32) {
            return {
                primary: "black",
                secondary: "black"
            }
        }

        //similarly, if all RGB are 223-255?  WHITE/WHITE
        if (red >= 223 && green >= 223 && blue >= 223) {
            return {
                primary: "white",
                secondary: "white"
            }
        }

        //Others are: highest color is 223 or higher; others are 64 or less
        if (red >= 223 && green <= 64 && blue <= 64) {
            return {
                primary: "red",
                secondary: "red"
            }
        }

        if (red <= 64 && green >= 223 && blue <= 64) {
            return {
                primary: "green",
                secondary: "green"
            }
        }

        if (red <= 64 && green >= 223 && blue <= 64) {
            return {
                primary: "blue",
                secondary: "blue"
            }
        }

        //Next, check for grayscale range - all values within 32 of each other
        if (Math.abs(red - green) <= 32 && Math.abs(red - blue) <= 32 && Math.abs(blue - green) <= 32) {
            //quick check for the order of the black and white 
            //This math will put us on the more white end of the spectrum, so white goes first
            if ((red + green + blue) - 96 >= 480) {
                return {
                    primary: "white",
                    secondary: "black"
                }
            }
            else {
                return {
                    primary: "black",
                    secondary: "white"
                }
            }
        }

        //Everything else depends on which color is highest -- the secondary is either the next highest color, or a grayscale value (if the two other colors are close)
        const result = {
            primary: "",
            secondary: ""
        }

        //First, find the value that is closest to 255 - that will be our primary
        const sortedColors = [
            { name: "red", value: red },
            { name: "green", value: green },
            { name: "blue", value: blue }]
            .sort((a, b) => b.value - a.value);

        //The first item in our sorted colors array will automatically be the primary color
        result.primary = sortedColors[0].name;

        //Next, check if the other two values are within 32 of each other - in that case, secondary will actually be either white or black
        if (Math.abs(sortedColors[1].value - sortedColors[2].value) <= 32) {
            //If the sorted colors are on the 128 side, use white as the secondary
            if (sortedColors[1].value + sortedColors[2].value >= 224) {
                result.secondary = "white";
            }
            else {
                result.secondary = "black";
            }
        }
        else { //otherwise, the secondary color is just the next highest color by value
            result.secondary = sortedColors[1].name;
        }

        return result;
    }

    determineInteger(controlGene) {
        //INPUT: a control gene
        //OUTPUT: a zero or positive integer value (based on the # of bits in the gene sequence) 
        const { startIndex, numGenesToExpress } = controlGene;
     
        //sanity check that we have enough genes to read
        const dnaLength = this.dna.sequence.length;
        if (startIndex < 0 || startIndex >= dnaLength || numGenesToExpress < 1
            || (startIndex + numGenesToExpress - 1) >= dnaLength) {
            return null;
        }
        
        //since we have a valid sequence, iterate over it to interpret the number
        //numbers are encoded as powers of 2, starting at 2^0 and moving higher 

        const numberGenes = this.dna.sequence
            .slice(startIndex, startIndex + numGenesToExpress)
            .map(eachGenePair => this.determineDominance(eachGenePair));


        let resultNum = 0;
        let bit = 0;
        numberGenes.forEach(gene => {
            resultNum += (gene.value === 1 ? Math.pow(2, bit) : 0);
            bit += 1;
        });
        
        return resultNum;
    }


    //INPUT: a control gene (which is expected to have a populated 'references' array)
    //OUTPUT: either null, or an array containing the results of the populations
    /*     resolveReferences(controlGene) {
            //First, fail the lookup if there's no references
            if (!controlGene.references || controlGene.references.length < 1) {
                return null;
            }
            //Next, for each reference that we are given:
            //1) check if we already have a rendered phenotype property to pull from
            //2) if not, read the genome to resolve references
            const resultArray = [];
    
    
            return resultArray;
        } */

    //INPUT: a control gene (which is expected to have a populated 'references' array)
    //OUTPUT: either null (if reference could not be resolved) OR the expect result
    resolveSingleReference(controlGene) {
        //First, fail the lookup if there's either no references, or too many 
        if (!controlGene.references || controlGene.references.length > 1) {
            return null;
        }

        //Next, check if the reference applies to a phenotype key (which is preferred)
        const soloSource = controlGene.references[0];
        if (this.hasOwnProperty(soloSource)) {
            return this[soloSource];
        }
        //otherwise, we attempt to look up the reference in the control gene sequence
        //and then interpret using THAT control gene :)
        else {
            //NOTE: in order to be sure that we have a valid reference pair, we need to make sure that the alleles we are looking are not null
            const referencePair = this.dna.controlGenes
                .filter(genePair => {
                    let alleleOne = genePair[0];
                    let alleleTwo = genePair[1];
                    if (alleleOne !== null && alleleOne.controlGeneKeyName === soloSource) {
                        return true;
                    }
                    else if (alleleTwo !== null && alleleTwo.controlGeneKeyName === soloSource) {
                        return true;
                    }
                    return false;
                });

            //And if our filter search didn't find anything at all, stop processing
            if (!referencePair || referencePair.length !== 1) {
                return null;
            }

            //otherwise, we will go ahead and attempt to read the gene sequence!
            const referenceToExpress = this.determineDominance(referencePair[0]);
            return this[referenceToExpress.rnaMethod](referenceToExpress);
        }
    }

    determineDominance(gene) {
        const firstAllele = gene[0];
        const secondAllele = gene[1];
        //GENETIC ILLNESS handling!
        //Will have a 50/50 chance of madness here
        //NOTE: since this is an illness, it feels okay that it may behave randomly
        if (firstAllele === null || secondAllele === null) {
            return this.getRandomAllele(gene);
        }

        //Otherwise, we're in the land of traditional mendellian genetics as expected
        //If one is dominant but not the other, return that
        if (firstAllele.isDominant && !secondAllele.isDominant) {
            return firstAllele;
        }
        if (!firstAllele.isDominant && secondAllele.isDominant) {
            return secondAllele;
        }

        //otherwise, codominant/corecessive genes are returned at random
        return this.getRandomAllele(gene);
    }

    getRandomAllele(gene) {
        const whichGene = Math.floor(Math.random() * Math.floor(2));
        return (whichGene ? gene[0] : gene[1]);
    }

}

module.exports = Pet;

