'use strict';

var _      = require('underscore');
var expect = require('chai').expect;
var uint   = require('../uint');

describe('Construction throw testing', function() {
  
  it('throw "Canary"', function() {
    expect(function() {
      throw 'Canary';
    }).to.throw();
  });

  /* This should not generate an exception 
  it('UInt({ bits: 33, value: 1}) throws', function() {
    expect(function() {
      new uint.UInt({bits: 33, value: 1});
    }).to.throw();
  });
  */

  it('UInt({ bits: 16, value: 0x1ffff }) throws', function() {
    expect(function() {
      new uint.UInt({ bits: 16, value: 0x1ffff });
    }).to.throw();
  });
    
  it('UInt({ bytes: 2, value: 0x1ffff }) throws', function() {
    expect(function() {
      new uint.UInt({ bytes: 2, value: 0x1ffff });
    }).to.throw();
  });
    
  it('UInt({ bytes: 2, value: "0x1ffff" }) throws', function() {
    expect(function() {
      new uint.UInt({ bytes: 2, value: "0x1ffff" });
    }).to.throw();
  });
    
  it('UInt({ bytes: 2, value: -1 }) throws', function() {
    expect(function() {
      new uint.UInt({ bytes: 2, value: -1 });
    }).to.throw();
  });
    
  it('UInt({ bytes: 2, value: "-65536" }) throws', function() {
    expect(function() {
      new uint.UInt({ bytes: 2, value: "-65536" });
    }).to.throw();
  });
  
  it('UInt({ bytes: 2, value: "0xx0000" }) throws', function() {
    expect(function() {
      new uint.UInt({ bytes: 2, value: "0xx0000" });
    }).to.throw();
  });

  it('UInt({ value: "q" }) throws', function() {
    expect(function() {
      new uint.UInt({ value: "q" });
    }).to.throw();
  });

  it('UInt({ "0xx00" }) throws', function() {
    expect(function() {
      new uint.UInt({ value: "0xx00" });
    }).to.throw();
  });

  it('UInt({ value: 1.2 }) throws', function() {
    expect(function() {
      new uint.UInt({ value: 1.2 });
    }).to.throw();
  });

  it('UInt({ value: "" }) throws', function() {
    expect(function() {
      new uint.UInt({ value: "" });
    }).to.throw();
  });

});

describe('Construction no-throw testing', function() {

  it('UInt({ value: 0 })', function() {
    (new uint.UInt({ value: 0 }));
  });

  it('UInt({ bytes: 2, value: 0x0800 })', function() {
    new uint.UInt({ bytes: 2, value: 0x0800 });
  });

  it('UInt(UInt({ bits: 16, value: 0x0806 }))', function() {
    new uint.UInt({ bits: 16, value: 0x0806 });
  });

  it('UInt({ bits: 16 })', function() {
    new uint.UInt({ bits: 16 });
  });

  it('UInt({ bytes: 2 })', function() {
    new uint.UInt({ bytes: 2 });
  });

  it('UInt({ bytes: 4, value: 0x0a0101f0 })', function() {
    new uint.UInt({ bytes: 4, value: 0x0a0101f0 });
  });
  
  it('UInt({ bits: 32, value: 0x0b0101f0 })', function() {
    new uint.UInt({ bits: 32, value: 0x0b0101f0 });
  });


});

describe('Construction internal value testing', function() {

  it('UInt({ bits: 16, value: 0xffff }) === 0xffff', function() {
    var val = new uint.UInt({ bits: 16, value: 0xffff });
    expect(val.value()).to.equal(0xffff);
  });
  
  it('UInt({ bytes: 2, value: 0xffff }) === 0xffff', function() {
    var val = new uint.UInt({ bytes: 2, value: 0xffff });
    expect(val.value()).to.equal(0xffff);
  });
  
  it('UInt({ bytes: 4, value: 0xffffffff }) === 0xffffffff', function() {
    var val = new uint.UInt({ bytes: 4, value: 0xffffffff });
    expect(val.value()).to.equal(0xffffffff);
  });
  
  it('UInt({ bits: 48, value: 0xffffffffffff }) === 0xffffffffffff', function() {
    var val = new uint.UInt({ bits: 48, value: 0xffffffffffff });
    expect(val.value()).to.deep.equal([
      0xff, 0xff, 0xff,
      0xff, 0xff, 0xff
    ]);
  });
  
  it('UInt({ bytes: 16, value: "0xffffffffffffffffffffffffffffffff" }) === [0xff]', function() {
    var val = new uint.UInt({ bytes: 16, value: '0xffffffffffffffffffffffffffffffff' });
    expect(val.value()).to.deep.equal([
      0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff
    ]);
    expect(val.value()).to.not.deep.equal([
      0xff, 0xff, 0xff, 0xf1, 
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff
    ]);
  });

  it('UInt({ value: [....] }) === [....]', function() {
    var val = new uint.UInt({ value: [
      0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff
    ]});
    expect(val.value()).to.deep.equal([
      0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff
    ]);

    var val2 = new uint.UInt({ bytes: 6, value: '0x010203040506' });
    expect(val2.value()).to.deep.equal([ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06 ]);

  });
  
});

describe('Construction from json', function() {

  it('fromJSON({ _value: 2 }).value() === 2', function() {
    var val = uint.fromJSON(JSON.stringify({
      _bits: 4,
      _bytes: 0,
      _value: 2
    }));
    expect(val.value()).to.equal(2);
  });

});

describe('Construction from copy', function() {
  it('UInt({ bits: 16, value: 0xffff }) === 0xffff', function() {
    var val = new uint.UInt({ bits: 16, value: 0xffff });
    var copy = uint.copy(val);
    expect(val.value()).to.equal(copy.value());

  });
  
  it('UInt({ bytes: 2, value: 0xffff }) === 0xffff', function() {
    var val = new uint.UInt({ bytes: 2, value: 0xffff });
    var copy = uint.copy(val);
    expect(val.value()).to.equal(copy.value());
  });
  
  it('UInt({ bytes: 4, value: 0xffffffff }) === 0xffffffff', function() {
    var val = new uint.UInt({ bytes: 4, value: 0xffffffff });
    var copy = uint.copy(val);
    expect(val.value()).to.equal(copy.value());
  });
  
  it('UInt({ bits: 48, value: 0xffffffffffff }) === 0xffffffffffff', function() {
    var val = new uint.UInt({ bits: 48, value: 0xffffffffffff });
    var copy = uint.copy(val);
    expect(val.value()).to.equal(copy.value());
  });

});

