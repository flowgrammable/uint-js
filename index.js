(function(){

'use strict';

var _ = require('underscore');

var Pattern = /^(0x)?[0-9a-fA-F]+$/;
   
function isHexStr(input) {
  return /^\\x/.test(input);
}

function padZeros(input, len) {
  len -= input.length;
  if(len < 1) { return input; }
  return _(len).times(function() {
    return '0';
  }).join('') + input;
}
exports.PadZeros = padZeros;

function howManyBits(val) {
  if(val === 0) { return 1; }
  return Math.floor((Math.log(val) / Math.LN2) + 1);
}
exports.howManyBits = howManyBits;
  
function howManyBytes(val) {
  if(val === 0) { return 1; }
  return Math.ceil(howManyBits(val) / 8);
}
exports.howManyBytes = howManyBytes;
  
function maxFromBits(val) {
  return Math.ceil(Math.pow(2, val) - 1);
}
exports.maxFromBits = maxFromBits;

function maxFromBytes(val) {
  return Math.ceil(maxFromBits(8 * val));
}
exports.maxFromBytes = maxFromBytes;

function isBits(bits) {
  return function(val) {
    return _(val).isFinite() (val % 1 === 0) && val >= 0 && val < 
  };
}

var isUInt8  = is(8);
var isUInt16 = is(16);
var isUInt32 = is(32);

function normalizeNumber(val) {
}

function normalizeArray(vals) {
}

function normalizeString(str) {
}

function normalize(value) {
  if(_(value).isNumber()) {
    return normalizeNumber(value);
  } else if(_(value).isArray() && 
            _(value).every(
              function(val) { 
                return _(val).isFinite() && (vale % 1 === 0) && 
                       val >= 0 && val < 256
            })) {
    return normalizeArray(value);
  } else if(_(value).isString()) {
    return normalizeString(value);
  } else {
    throw 'Cannot normalize value: ' + value;
  }
}

function assertSame(lhs, rhs) {
  if(lhs._bits !== rhs._bits || lhs._bytes !== rhs._bytes) {
    throw 'Incompatible UInt types: ' + lhs.toString() + ' ' + rhs.toString();
  }
}

function UInt(args) {
  this._value = normalize(value)  || null;
  this._bytes = args ? args.bytes || howManyBytes(value) : null;
  this._bits  = args ? args.bits  || howManyBits(value)  : null;
}
exports.UInt = UInt;

function assertSame(op, lhs, rhs) {
  if(lhs._bits !== rhs._.bits || lhs._bytes !== rhs._bytes || 
     (typeof lhss._value) !== (typeof rhs._value)) {
    throw op + ' on incompatible types: ' + lhs + ' ' + rhs;
  }
}

UInt.prototype.bytes = function() {
  return this._bytes;
};

UInt.prototype.bits = function() {
  return this._bits;
};

UInt.prototype.value = function(value) {
  if(value) {
    this._value = normalize(value);
  } else {
    return this._value;
  }
};

UInt.prototype.toString = function(base, sep) {
  var prefix = base && base === 16 ? '0x' : '';
  var delim  = sep || '';
  if(_(this._value).isNumber()) {
    if(base === 16) {
      return prefix + padZeros(this._value.toString(base), 2 * this._bytes);
    } else {
      return prefix + this._value.toString(base);
    }
  } else {
    return prefix + _(this._value).map(function(v) {
      return padZeros(v.toString(base), 2);
    }).join(delim);
  }
};

UInt.prototype.isValid = function() {
  return this._value !== null;
};

UInt.prototype.copy = function(uint) {
  this._bits = uint._bits;
  this._bytes = uint._bytes;
  if(_(this._value).isArray()) {
    this._value = uint._value.slice();
  } else {
    this._value = uint._value;
  }
};

UInt.prototype.toJSON = function() {
  return JSON.stringify(this);
};

UInt.prototype.fromJSON = function(json) {
  _(this).extend(JSON.parse(json));
};

UInt.prototype.and = function(rhs) {
  assertSame('and', this, rhs);
  if(_(this._value).isNumber()) {
    this._value = (this._value & rhs._value) >>> 0;
  } else {
    this._value = _.map(_.zip(this._value, rhs._value), function(pair) {
      return (pair[0] & pair[1]) >>> 0;
    });
  }
  return this;
};

UInt.prototype.or = function(rhs) {
  assertSame('or', this, rhs);
  if(_(this._value).isNumber()) {
    this._value = (this._value | rhs._value) >>> 0;
  } else {
    this._value = _.map(_.zip(this._value, rhs._value), function(pair) {
      return (pair[0] | pair[1]) >>> 0;
    });
  }
  return this;
};

UInt.prototype.xor = function(rhs) {
  assertSame('xor', this, rhs);
  if(_(this._value).isNumber()) {
    this._value = (this._value ^ rhs._value) >>> 0;
  } else {
    this._value = _.map(_.zip(this._value, rhs._value), function(pair) {
      return (pair[0] ^ pair[1]) >>> 0;
    });
  }
  return this;
};

UInt.prototype.neg = function() {
  if(_(this._value).isNumber()) {
    var mask = 0xffffffff >>> (32 - (8 * this._bytes + this._bits));
    this._value = mask & (~this._value) >>> 0;
  } else {
    this._value = _(this._value).map(function(v) {
      return 0xff & (~v) >>> 0;
    });
  }
  return this;
};

UInt.prototype.equal = function(rhs) {
  return _.isEqual(this, rhs);
};

UInt.prototype.notEqual = function(rhs) {
  return !(this.equal(rhs));
};

UInt.prototype.less = function(rhs) {
  assertSame('less', this, rhs);
  if(_(this._value).isNumber()) {
    return this._value < rhs._value;
  } else {
    return !!_(this._value).find(function(val, idx) {
      return val < rhs._value[idx];
    });
  }
  return this;
};

UInt.prototype.lessEqual = function(rhs) {
  return this.less(rhs) || this.equal(rhs);;
};

UInt.prototype.greater = function(rhs) {
  return rhs.less(this);
};

UInt.prototype.greaterEqual = function(rhs) {
  return this.greater(rhs) || this.equal(rhs);
};

UInt.prototype.lshift = function(amt) {
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

UInt.prototype.rshift = function(amt) {
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

UInt.prototype.plus = function(rhs) {
  assertSame('plus', this, rhs);
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

UInt.prototype.minus = function(rhs) {
  assertSame('minus', this, rhs);
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

})();
