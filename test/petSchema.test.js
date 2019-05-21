const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const Pet = require("../models/pet");

describe('Pet Schema', function () {
    it('should be valid if name is alphanumeric with spaces', function (done) {
        var m = new Pet({ name: "Mister Bigglesw0rth", dna: validDNA });

        m.validate(function (err) {
            expect(err).to.not.exist;
            done();
        });
    });

    it('should be invalid if name contains special characters', function (done) {
        var m = new Pet({ name: "JoJo!" });

        m.validate(function (err) {
            expect(err.errors.name).to.exist;
            done();
        });
    });

    it('should be invalid if name is greater than 50 characters', function (done) {
        var m = new Pet({ name: "AbcdefghijklmnopqrstuvwxyzAbcdefghijklmnopqrstuvwxy" });

        m.validate(function (err) {
            expect(err.errors.name).to.exist;
            done();
        });
    });

});