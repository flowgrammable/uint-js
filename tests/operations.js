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

  it('UInt({ value: <string> }) -> toString : is same', function() {
    var v = new uint.UInt({ bytes: 2, value: '0x800' });
    expect(v.toString(16)).to.equal('0x0800');
  });
  
  it('UInt({ value: <number> }) -> toString : is same', function() {
    var v = new uint.UInt({ bytes: 2, value: 12345 });
    expect(v.toString(16)).to.equal('0x3039');
  });

  it('UInt({ value: <number>, bytes: X }) -> toString : is same', function() {
    var uint32 = new uint.UInt({ value: 101, bytes: 4 });
    var uint24 = new uint.UInt({ value: 101, bytes: 3 });
    var uint16 = new uint.UInt({ value: 101, bytes: 2 });
    var uint8 = new uint.UInt({ value: 3, bytes: 1 });

    expect(uint32.toString()).to.equal('101');
    expect(uint32.toString(16)).to.equal('0x00000065');
    expect(uint24.toString()).to.equal('101');
    expect(uint24.toString(16)).to.equal('0x000065');
    expect(uint16.toString()).to.equal('101');
    expect(uint16.toString(16)).to.equal('0x0065');
    expect(uint8.toString()).to.equal('3');
    expect(uint8.toString(16)).to.equal('0x03');
  });

  it('UInt({ value: 240, bytes: 1 }) -> toString : is same', function(){
    var b = new uint.UInt({ value: 240, bytes: 1 });
    expect(b.toString(16)).to.equal('0xf0');

    var a = new uint.UInt({ 
      value: [255, 240, 255, 255, 255, 255, 255, 255], 
      bytes: 8 
    });
    expect(a.toString(16)).to.equal('0xfff0ffffffffffff')
  });

});

describe('Equality testing', function() {
  it('UInt({ value: 101, bytes: 4 }) === ...', function() {
    var uint1 = new uint.UInt({ value: 101, bytes: 4 });
    var uint2 = new uint.UInt({ value: 101, bytes: 4 });
    expect(uint.equal(uint1, uint2)).to.be.true;
    expect(uint1.equal(uint2)).to.be.true;
    expect(uint2.equal(uint1)).to.be.true;
  });
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

  /* FIXME new - integrate
  it('UInt addition ', function(){
    var a = new UInt.UInt(null, [255, 255, 255, 255, 255, 254], 6);
    var b = new UInt.UInt(null, [0,0,0,0,0,1], 6);
    expect(a.or(b).value[5]).toBe(255);
  });
  */

  /* FIXME new - integrate
  it('UInt subtraction', function(){
    var a = new UInt.UInt(null, [255, 255, 255, 255, 255, 0], 6);
    var b = new UInt.UInt(null, [0,0,0,0,0,1], 6);
    var ans = a.subt(b);
    expect(ans.value[0]).toBe(255);
    expect(ans.value[5]).toBe(255);
    
    var c = new UInt.UInt(null, [255, 0, 0, 0, 0, 1], 6);
    var d = new UInt.UInt(null, [255, 0, 0, 0, 0, 0], 6);
    var ansb = c.subt(d);
    expect(ansb.value[0]).toBe(0);
    expect(ansb.value[5]).toBe(1);
    
    var e = new UInt.UInt(null, [255, 0, 0, 0, 0, 0], 6);
    var f = new UInt.UInt(null, [0, 0, 0, 0, 0, 1], 6);
    var ansc = e.subt(f);
    expect(ansc.value[0]).toBe(254);
    expect(ansc.value[5]).toBe(255);
  });
  */

});

