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
    var uint3 = new uint.UInt({ value: 100, bytes: 4 });
    expect(uint.equal(uint1, uint2)).to.be.true;
    expect(uint1.equal(uint2)).to.be.true;
    expect(uint2.equal(uint1)).to.be.true;

    expect(uint1.notEqual(uint3)).to.be.true;
    expect(uint.notEqual(uint2, uint3)).to.be.true;
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

    expect(small.lessEqual(small)).to.be.true;
    expect(large.lessEqual(large)).to.be.true;
    
    expect(small.greater(large)).to.be.false;
    expect(large.greater(small)).to.be.true;

    expect(small.greaterEqual(small)).to.be.true;
    expect(large.greaterEqual(large)).to.be.true;
  });

});

describe('Logical bitwise testing', function() {

  it('X & Y = Z', function() {
    var val1 = new uint.UInt({ bytes: 4, value: 0xffffffff });
    var val2 = new uint.UInt({ bytes: 4, value: 0xf0f0f0f0 });
    var val3 = uint.and(val1, val2);

    expect(val1.and(val2).value()).to.equal(val2.value());
    expect(val1.value()).to.equal(val3.value());

    var val4 = uint.and(val1, val1);
    expect(uint.equal(val1, val4)).to.be.true;
    
    var val5 = uint.and(val3, val3);
    expect(val2.equal(val5)).to.be.true;
    expect(uint.notEqual(val4, val5)).to.be.false;
  });

  it('X | Y = Z', function() {
    var val1 = new uint.UInt({ bytes: 4, value: 0xffffffff });
    var val2 = new uint.UInt({ bytes: 4, value: 0xf0f0f0f0 });
    var val3 = uint.or(val1, val2);

    expect(val1.or(val2).value()).to.equal(val1.value());
    expect(val1.value()).to.equal(val3.value());

    var val4 = uint.or(val1, val1);
    expect(uint.equal(val1, val4)).to.be.true;
    
    var val5 = uint.or(val3, val3);
    expect(val2.notEqual(val5)).to.be.true;
    expect(uint.equal(val4, val5)).to.be.true;
  });

  it('~X = Y', function() {
    var val1 = new uint.UInt({ bytes: 4, value: 0 });
    var val2 = new uint.UInt({ bytes: 4, value: 0xffffffff });
    var val3 = new uint.UInt({ bytes: 4, value: 0xf0f0f0f0 });
    var val4 = new uint.UInt({ bytes: 4, value: 0x0f0f0f0f });

    expect(uint.neg(val1).value()).to.equal(val2.value());
    expect(uint.neg(val2).value()).to.equal(val1.value());
    expect(uint.neg(uint.neg(val1)).value()).to.equal(val1.value());
    expect(uint.neg(uint.neg(val2)).value()).to.equal(val2.value());

    expect(val1.neg().value()).to.equal(val2.value());
    expect(val2.neg().neg().value()).to.equal(val1.value());
    
    expect(uint.neg(val3).value()).to.equal(val4.value());
    expect(uint.neg(val4).value()).to.equal(val3.value());
    expect(uint.neg(uint.neg(val3)).value()).to.equal(val3.value());
    expect(uint.neg(uint.neg(val4)).value()).to.equal(val4.value());

    expect(val3.neg().value()).to.equal(val4.value());
    expect(val4.neg().neg().value()).to.equal(val4.value());
  });
  
  it('X ^ Y = Z', function() {
    var val1 = new uint.UInt({ bytes: 4, value: 0xffffffff });
    var val2 = new uint.UInt({ bytes: 4, value: 0xf0f0f0f0 });
    var val3 = uint.xor(val1, val2);

    expect(uint.xor(val1, val2).value()).to.equal(val3.value());
    expect(uint.xor(val1, val2).value()).to.equal(val2.neg().value());

    expect(val1.xor(val2).value()).to.equal(val2.neg().value());
    expect(val3.value()).to.equal(val2.neg().value());

    var val4 = uint.xor(val1, val1);
    var val5 = new uint.UInt({ bytes: 4, value: 0 });
    console.log(val4);
    expect(uint.equal(val4, val5)).to.be.true;
  });

  it('Match: X & Y = Z', function() {
    var all   = new uint.UInt({ bytes: 4, value: 0 });
    var exact = new uint.UInt({ bytes: 4, value: 0xffffffff });
    var classA = new uint.UInt({ bytes: 4, value: 0xff000000 });
    var classB = new uint.UInt({ bytes: 4, value: 0xffff0000 });
    var classC = new uint.UInt({ bytes: 4, value: 0xffffff00 });
    var net    = new uint.UInt({ bytes: 4, value: 0x01020300 });
    var direct = new uint.UInt({ bytes: 4, value: 0x01020301 });

    var p1 = new uint.UInt({ bytes: 4, value: 0x02020301 });
    var p2 = new uint.UInt({ bytes: 4, value: 0x01030301 });
    var p3 = new uint.UInt({ bytes: 4, value: 0x01020401 });
    var p4 = new uint.UInt({ bytes: 4, value: 0x01020304 });
    var p5 = new uint.UInt({ bytes: 4, value: 0x01020301 });

    var r1 = uint.and(net, all);
    var r2 = uint.and(net, classA);
    var r3 = uint.and(net, classB);
    var r4 = uint.and(net, classC);
    var r5 = uint.and(direct, exact);

    expect(r1.match(p1, all)).to.be.true;
    expect(r2.match(p1, classA)).to.be.false;
    expect(r3.match(p1, classB)).to.be.false;
    expect(r4.match(p1, classC)).to.be.false;
    expect(r5.match(p1, exact)).to.be.false;

    expect(r1.match(p2, all)).to.be.true;
    expect(r2.match(p2, classA)).to.be.true;
    expect(r3.match(p2, classB)).to.be.false;
    expect(r4.match(p2, classC)).to.be.false;
    expect(r5.match(p2, exact)).to.be.false;

    expect(r1.match(p3, all)).to.be.true;
    expect(r2.match(p3, classA)).to.be.true;
    expect(r3.match(p3, classB)).to.be.true;
    expect(r4.match(p3, classC)).to.be.false;
    expect(r5.match(p3, exact)).to.be.false;

    expect(r1.match(p4, all)).to.be.true;
    expect(r2.match(p4, classA)).to.be.true;
    expect(r3.match(p4, classB)).to.be.true;
    expect(r4.match(p4, classC)).to.be.true;
    expect(r5.match(p4, exact)).to.be.false;

    expect(r1.match(p5, all)).to.be.true;
    expect(r2.match(p5, classA)).to.be.true;
    expect(r3.match(p5, classB)).to.be.true;
    expect(r4.match(p5, classC)).to.be.true;
    expect(r5.match(p5, exact)).to.be.true;

    var broadcast = new uint.UInt({ bytes: 6, value: '0xffffffffffff' });

    var multicast = new uint.UInt({ bytes: 6, value: [
      0x01, 0x0, 0x0, 0x0, 0x0, 0x0
    ] });

    var uni = new uint.UInt({ bytes: 6, value: '0x102030405060' });
    var mul = new uint.UInt({ bytes: 6, value: '0x010203040506' });

    expect(uint.match(broadcast, broadcast, broadcast)).to.be.true;
    expect(uint.match(uni, broadcast, broadcast)).to.be.false;
    expect(uint.match(mul, broadcast, broadcast)).to.be.false;

    console.log(broadcast);
    console.log(multicast);
    console.log(mul);
    console.log(uni);
    expect(uint.match(multicast, broadcast, multicast)).to.be.true;
    expect(uint.match(multicast, uni, multicast)).to.be.false;
    console.log(uint.and(mul, multicast));
    expect(uint.match(multicast, mul, multicast)).to.be.true;

  });

});

describe('Arithmetic testing', function() {

  /* FIXME uncomment once plus is implmented
  it('UInt.plus', function(){
    var a = new uint.UInt({ value: [255, 255, 255, 255, 255, 254], bytes: 6 });
    var b = new uint.UInt({ value: [0,0,0,0,0,1], bytes: 6 });
    expect(a.plus(b).value()[5]).to.equal(255);
  });
  */

  /* FIXME uncomment once minus is implemented
  it('UInt.minus', function(){
    var a = new uint.UInt({ value: [255, 255, 255, 255, 255, 0], bytes: 6 });
    var b = new uint.UInt({ value: [0,0,0,0,0,1], bytes: 6 });
    var ans = a.minus(b);
    expect(ans.value()[0]).to.equal(255);
    expect(ans.value()[5]).to.equal(255);
    
    var c = new uint.UInt({ value: [255, 0, 0, 0, 0, 1], bytes: 6 });
    var d = new uint.UInt({ value: [255, 0, 0, 0, 0, 0], bytes: 6 });
    var ansb = c.minus(d);
    expect(ansb.value()[0]).to.equal(0);
    expect(ansb.value()[5]).to.equal(1);
    
    var e = new uint.UInt({ value: [255, 0, 0, 0, 0, 0], bytes: 6 });
    var f = new uint.UInt({ value: [0, 0, 0, 0, 0, 1], bytes: 6 });
    var ansc = e.minus(f);
    expect(ansc.value()[0]).to.equal(254);
    expect(ansc.value()[5]).to.equal(255);
  });
  */

});

