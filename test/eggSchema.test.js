const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const Egg = require("../models/egg");

describe('Egg Schema', function() {
    it('should have a creation date', function(done) {
        let e = new Egg;
 
        e.validate(function(err) {
            expect(err).to.not.exist;
            done();
        });
    });

    it('creation date cannot be null', function(done) {
        var e = new Egg({createdOn: ""});
 
        e.validate(function(err) {
            expect(err.errors.createdOn).to.exist;
            done();
        });
    });

});