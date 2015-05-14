'use strict';

var _      = require('underscore');
var expect = require('chai').expect;

var uint = require('../uint');

describe('Serialization testing', function() {

  it('UInt -> toJSON -> fromJSON : is same', function() {
    var val1 = new uint.UInt({ value: 0x0f0f0f });
    var val2 = uint.fromJSON(uint.toJSON(val1));

    expect(val1.value()).to.equal(val2.value());
    expect(val1.toString(16)).to.equal('0xf0f0f');

    var val3 = new uint.UInt({ value: val2.toString() });
    expect(val1.value()).to.equal(val3.value());
  });

});

describe('Equality testing', function() {
});

describe('Relational testing', function() {
});

describe('Logical bitwise testing', function() {
});

describe('Arithmetic testing', function() {
});

