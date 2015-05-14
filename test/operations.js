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

  /* FIXME this is a test for a general function
  it('UInt toString natural ', function(){
    var str = UInt.toString(32);
    expect(str(1,16)).toBe('0x00000001');
    expect(str(4294967295, 16)).toBe('0xffffffff');
  });
   
  it('UInt toString throw', function(){
    //   expect(function(){
    //    var str = UInt.toString('');
    //    var t = str(33, 16);
    //  }).toThrow();
    
    expect(function(){
      var str = UInt.toString({a:'1'});
      var t = str('a', 16);
    }).toThrow();
  });
  
  it('UInt toString array', function(){
    var str = UInt.toString(33);
    expect(str([0,0,0,0,1],16)).toBe('0x0000000001')
  });
  */

});

describe('Equality testing', function() {
});

describe('Relational testing', function() {

  it('UInt: [0,0,0,0,0,1] < [255, 255, 255, 255, 255, 255]', function(){
    var large = new uint.UInt({ value: [255, 255, 255, 255, 255, 255] });
    var small = new uint.UInt({ value: [0,0,0,0,0,1] });
    expect(small.less(small)).to.be.false;
    expect(small.less(large)).to.be.true;
    expect(large.less(small)).to.be.false;
    expect(large.less(large)).to.be.false;
  });

});

describe('Logical bitwise testing', function() {
});

describe('Arithmetic testing', function() {
});

