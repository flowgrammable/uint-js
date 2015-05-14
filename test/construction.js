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

  /* FIXME: Determine if these are in fact valid tests
  it('UInt( {bits: 0 }) throws', function() {
    expect(function() {
      new uint.UInt({ bits: 0 });
    }).to.throw();
  });

  it('UInt({ bytes: 0 }) throws', function() {
    expect(function() {
      new uint.UInt({ bytes: 0 });
    }).to.throw();
  });
  */
  
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
  });


});

