'use strict';

var _      = require('underscore');
var expect = require('chai').expect;
var uint   = require('../uint');

describe('UInt match testing', function() {

  
  it('', function() {
    var type1 = new uint.UInt({value: 0x0800, bytes: 2});
    var type2 = new uint.UInt({value: 0x0806, bytes: 2});
    
    var exact1 = new uint.Match({
      value: uint.mk(2, 0x0800),
      mask: uint.mk(2, 0xffff)
    });

    var exact2 = uint.makeExactMatch(type1);
    
    var wildcard1 = new uint.Match({
      value: uint.mk(2, 0x0000),
      mask: uint.mk(2, 0x0000)
    });
    
    var wildcard2 = uint.makeAllMatch(type1);
    var wildcard3 = uint.makeAllMatch(type2);
    expect(exact1.match(type1)).to.equal(true);
    expect(exact2.match(type1)).to.equal(true);
    expect(wildcard1.match(type1)).to.equal(true);
    expect(wildcard2.match(type1)).to.equal(true);
    expect(wildcard3.match(type1)).to.equal(true);
               
    expect(exact1.match(type2)).to.equal(false);
    expect(exact2.match(type2)).to.equal(false);
    expect(wildcard1.match(type2)).to.equal(true);
    expect(wildcard2.match(type2)).to.equal(true);
    expect(wildcard3.match(type2)).to.equal(true);
  });

  /*
  it('', function() {
    var type1 = new UInt.UInt(null, 0x0800, 2);
    var type2 = new UInt.UInt(null, 0x1, 2);
    
    var wildcard1 = new UInt.Match(null,
      new UInt.UInt(null, 0x1, 2),
      new UInt.UInt(null, 0x0, 2));
      
    expect(wildcard1.match(type1)).toBe(true);
    expect(wildcard1.match(type2)).toBe(true);
  });
  */

  /*
  it('', function() {
    var empty     = new UInt.UInt(null, null, 6);
    var broadcast = (new UInt.UInt(null, null, 6)).neg();
    
    var mac1 = new UInt.UInt(null, [0, 1, 2, 3, 4, 5], 6);
    var mac2 = new UInt.UInt(null, [0, 1, 2, 3, 4, 6], 6);
    
    var exact1_mac1 = new UInt.Match(null,
      new UInt.UInt(null, [0, 1, 2, 3, 4, 5], 6),
      new UInt.UInt(null, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 6));
      
    var exact2_mac1 = new UInt.Match.mkExact(mac1);
    
    var exact1_mac2 = new UInt.Match(null,
        new UInt.UInt(null, [0, 1, 2, 3, 4, 6], 6),
        new UInt.UInt(null, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 6));
    var exact2_mac2 = new UInt.Match.mkExact(mac2);
    
    var wildcard1_mac1 = new UInt.Match(null,
        new UInt.UInt(null, null, 6),
        new UInt.UInt(null, null, 6));
        
    var wildcard2_mac1 = new UInt.Match.mkWildcard(mac1);
    var wildcard3_mac1 = new UInt.Match.mkWildcard(6);
    
    var wildcard1_mac2 = new UInt.Match(null,
        new UInt.UInt(null, null, 6),
        new UInt.UInt(null, null, 6));
        
    var wildcard2_mac2 = new UInt.Match.mkWildcard(mac2);
    var wildcard3_mac2 = new UInt.Match.mkWildcard(6);
               
    expect(exact1_mac1.match(mac1)).toBe(true);
    expect(exact2_mac1.match(mac1)).toBe(true);
    expect(wildcard1_mac1.match(mac1)).toBe(true);
    expect(wildcard2_mac1.match(mac1)).toBe(true);
    expect(wildcard3_mac1.match(mac1)).toBe(true);
    expect(exact1_mac1.match(mac2)).toBe(false);
    expect(exact2_mac1.match(mac2)).toBe(false);
    expect(wildcard1_mac1.match(mac2)).toBe(true);
    expect(wildcard2_mac1.match(mac2)).toBe(true);
    expect(wildcard3_mac1.match(mac2)).toBe(true);
                        
    expect(exact1_mac2.match(mac1)).toBe(false);
    expect(exact2_mac2.match(mac1)).toBe(false);
    expect(wildcard1_mac2.match(mac1)).toBe(true);
    expect(wildcard2_mac2.match(mac1)).toBe(true);
    expect(wildcard3_mac2.match(mac1)).toBe(true);
    expect(exact1_mac2.match(mac2)).toBe(true);
    expect(exact2_mac2.match(mac2)).toBe(true);
    expect(wildcard1_mac2.match(mac2)).toBe(true);
    expect(wildcard2_mac2.match(mac2)).toBe(true);
    expect(wildcard3_mac2.match(mac2)).toBe(true);
  })();
  */

  /*
  it('', function() {
    var route1 = new UInt.Match(null,
      new UInt.UInt(null, 0x0a000000, 4),
      new UInt.UInt(null, 0xff000000, 4));

    var route2 = new UInt.Match(null,
      new UInt.UInt(null, 0x0a0b0000, 4),
      new UInt.UInt(null, 0xffff0000, 4));

    var dst1 = new UInt.UInt(null, 0x0a0a0101, 4);
    var dst2 = new UInt.UInt(null, 0x0a0b0101, 4);
    var dst3 = new UInt.UInt(null, 0x0b0b0101, 4);
        
    expect(route1.match(dst1)).toBe(true);
    expect(route1.match(dst2)).toBe(true);
    expect(route1.match(dst3)).toBe(false);
    
    expect(route2.match(dst1)).toBe(false);
    expect(route2.match(dst2)).toBe(true);
    expect(route2.match(dst3)).toBe(false);
  });
  */

  /*
  it('', function() {
    var route3 = new UInt.Match(null,
      new UInt.UInt(null, 0xfedcbaaa, 4),
      new UInt.UInt(null, 0xffffffff, 4));
      
    var dst4 = new UInt.UInt(null, 0xfedcbaaa, 4);
       
    expect(route3.match(dst4)).toBe(true);
  });
  */

  /*
  it('', function() {
    var metadata = new UInt.UInt(null, [1, 2, 3, 4, 5, 6, 7, 8], 8);
    var mask1 = new UInt.UInt(null, [0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff], 8);
    var mask2 = new UInt.UInt(null, [0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0], 8);
    var value = new UInt.UInt(null, [8, 7, 6, 5, 4, 3, 2, 1], 8);
    
    expect(metadata.toString(16)).toBe('0x0102030405060708');
    
    var result = UInt.mask(metadata, value, mask1);
    expect(result.toString(16)).toBe('0x0107030505030701');
          
    metadata.mask(value, mask2);
    expect(metadata.toString(16)).toBe('0x0802060404060208');
  });

  it('', function() {
    var uint1 = new UInt.Match(null, new UInt.UInt(null, 111,4), new UInt.UInt(null, 222,4));
    var uint2 = new UInt.Match(null, new UInt.UInt(null, 111,4), new UInt.UInt(null, 222,4));
    
    expect(uint1.equal(uint2)).toBe(true);
  });
  */

});
