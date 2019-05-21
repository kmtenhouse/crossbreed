//EGG CLASS
//Goal is to create new eggs from parental DNA

//DNA validators make sure that the parents' dna object has the correct keys, etc
//const checkDNA = require('../../validators/dnaValidator');

class Egg {
    //The egg class takes in two parents and returns an egg
    constructor(mom, dad) {
        if (!mom.hasOwnProperty('dna') || !dad.hasOwnProperty('dna')) {
            throw new Error("Parents must have DNA!");
        }

        this.dna = {
            controlGenes: [],
            sequence: []
        };

        //Splicing and recombining the main DNA sequence 
        //NOTE: if one parent has fewer genes than the other, the creature will inherit 'null' instead of an allele for those genes
        //As a result, breeding creatures from different species is a highly risky process that is liable to create nonviable pets 
        let momIndex = 0;
        let dadIndex = 0;
        const maxMomGenes = mom.dna.sequence.length;
        const maxDadGenes = dad.dna.sequence.length;

        while (momIndex < maxMomGenes && dadIndex < maxDadGenes) {
            let randomMomAllele = this.getRandomAllele(mom.dna.sequence[momIndex]);
            let randomDadAllele = this.getRandomAllele(dad.dna.sequence[dadIndex]);
            this.dna.sequence.push([randomMomAllele, randomDadAllele]);
            momIndex += 1;
            dadIndex += 1;
        }
        //If one parent has more genes, add in a random allele from them...
        //the other parent's contribution will just be null
        for (let i = momIndex; i < maxMomGenes; i++) {
            let randomExtraMomAllele = this.getRandomAllele(mom.dna.sequence[i]);
            this.dna.sequence.push([randomExtraMomAllele, ""]);
        }
        for (let j = dadIndex; j < maxDadGenes; j++) {
            let randomExtraDadAllele = this.getRandomAllele(dad.dna.sequence[j]);
            this.dna.sequence.push(["", randomExtraDadAllele]);
        }

        //Next we tackle the hard part: control genes
        //These alleles MUST be matched like-for-like, otherwise we run the risk of ridiculously unviable genomes 

        //We will handle this by making some quick maps of the format  
        //{ controlGeneKeyName: randomly_chosen_allele }
        //This allows us to quickly pair mom & dad's control gene alleles by their names
        //(while leaving flexibility in the way we validate genes in the db)
        const momControlAlleles = {};
        const dadControlAlleles = {};

        mom.dna.controlGenes.forEach(genePair => {
            let randomizedAllele = this.getRandomAllele(genePair);
            let { controlGeneKeyName } = randomizedAllele;
            momControlAlleles[controlGeneKeyName] = randomizedAllele;
        });

        dad.dna.controlGenes.forEach(genePair => {
            let randomizedAllele = this.getRandomAllele(genePair);
            let { controlGeneKeyName } = randomizedAllele;
            dadControlAlleles[controlGeneKeyName] = randomizedAllele;
        });

        //Now we pair the alleles
        //We will arbitrarily start by looking at the alleles mom is contributing
        //If dad has a matching control gene (by name), we pair the two alleles...
        for (let key in momControlAlleles) {
            if (dadControlAlleles.hasOwnProperty(key)) {
                this.dna.controlGenes.push(
                    [ momControlAlleles[key], dadControlAlleles[key] ]);
            }
        //otherwise, we contribute a single allele from mom and offer a NULL from dad
        //this confers a very high rate of genetic illness!
            else {
                console.log("Genetic illness potential (from dad) detected!  Dad missing " + key);
                this.dna.controlGenes.push([momControlAlleles[key], null]);
            }
        }

        //Now we need to check if DAD has any control genes that mom doesn't have
        //If so, we'll contribute a single allele from dad and offer a NULL from mom
        //(again, this confers a very high rate of genetic illness)
        for(let key in dadControlAlleles) {
            if(!momControlAlleles.hasOwnProperty(key)) {
                console.log("Genetic illness potential (from mom) detected! Mom missing " + key);
                this.dna.controlGenes.push([null, dadControlAlleles[key]]);
            }   
        }

        //Lastly, add the parents' obj _id to the child's array of parents 
        //(assuming the parent does have an obj _id
        this.parents = [];
        if (mom._id !== undefined && mom._id) {
            this.parents.push(mom._id);
        }
        if (dad._id !== undefined && dad._id) {
            this.parents.push(dad._id);
        }
    }

    getRandomAllele(gene) {
        const whichGene = Math.floor(Math.random() * Math.floor(2));
        return (whichGene ? gene[0] : gene[1]);
    }

    toObj() {
        return {
            dna: this.dna,
            parents: this.parents
        };
    }
}

module.exports = Egg;