'use strict';

var _      = require('underscore');
var expect = require('chai').expect;
var uint   = require('../uint');

describe('Utility funciton testing', function() {

  it('padZeros', function() {
    expect(uint.padZeros('0', 4)).to.equal('0000');
    expect(uint.padZeros('00', 4)).to.equal('0000');
    expect(uint.padZeros('000', 4)).to.equal('0000');
    expect(uint.padZeros('0000', 4)).to.equal('0000');
    expect(uint.padZeros('000000', 6)).to.equal('000000');
  });

  it('isInteger Positive tests', function() {
    expect(uint.isInteger(0)).to.be.true;
    expect(uint.isInteger(0x0)).to.be.true;
    expect(uint.isInteger(Math.pow(2, 52))).to.be.true;
    expect(uint.isInteger(-1)).to.be.true;
  });

  it('isInteger Negative tests', function() {
    expect(uint.isInteger(1.1)).to.be.false;
    expect(uint.isInteger(false)).to.be.false;
    expect(uint.isInteger([])).to.be.false;
    expect(uint.isInteger(undefined)).to.be.false;
    expect(uint.isInteger(null)).to.be.false;
    expect(uint.isInteger([0])).to.be.false;
    expect(uint.isInteger('0')).to.be.false;
    //expect(uint.isInteger(Math.pow(2, 53))).to.be.false;
  });

  it('isNatural Positive tests', function() {
    expect(uint.isNatural(0)).to.be.true;
    expect(uint.isNatural(0x0)).to.be.true;
    expect(uint.isNatural(Math.pow(2, 52))).to.be.true;
  });
  
  it('isNatural Negative tests', function() {
    expect(uint.isNatural(-1)).to.be.false;
  });

  it('howManyBits', function() {
    expect(uint.howManyBits(0)).to.equal(1);
    expect(uint.howManyBits(0x0)).to.equal(1);

    var tmp = 1;
    _.each(_.range(31), function(i) {
      expect(uint.howManyBits(tmp)).to.equal(i+1);
      tmp <<= 1;
    });
  });

  it('maxFromBits', function() {
    _.each(_.range(31), function(i) {
      expect(uint.maxFromBits(i+1)).to.equal(Math.pow(2, i+1)-1);
    });
  });

  it('howManyBytes', function() {
    expect(uint.howManyBytes(0)).to.equal(1);
    expect(uint.howManyBytes(0x0)).to.equal(1);

    var tmp = 1;
     _.each(_.range(31), function(i) {
       expect(uint.howManyBytes(tmp)).to.equal(Math.ceil((i+1)/8));
       tmp <<= 1;
     });
  });

  it('maxFromBytes', function() {
    _.each(_.range(4), function(i) {
      expect(uint.maxFromBytes(i+1)).to.equal(Math.pow(2, (8*(i+1)))-1);
    });
  });
});

