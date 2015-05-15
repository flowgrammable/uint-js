(function(){

'use strict';

// Cache the window or module pointer
var root = this;
// Ready a variable for the underscore library
var _ = null;

var Pattern = /^(0x)?[0-9a-fA-F]+$/;
   
function isHexStr(input) {
  return /^\\x/.test(input);
}

function isInteger(value) {
  // Javascript will convert several types to numbers if it can
  //  - string of a finite is a finite
  //  - empty array is a finite
  //  - array of a finite is a finte
  //
  //  We do not want this behavior so we ensure the value is not
  //  a string or an array
  return !_(value).isString() && !_(value).isArray() && 
         _(value).isFinite() && (value % 1 === 0);
}

function isNatural(value) {
  // Ensure is an integer and non-negative
  return isInteger(value) && value >= 0;
}

function padZeros(input, len) {
  len -= input.length;
  if(len < 1) { return input; }
  return _(len).times(function() {
    return '0';
  }).join('') + input;
}

function howManyBits(val) {
  if(val === 0 || val === 1) { return 1; }
  return Math.ceil(Math.log(val+1) / Math.LN2);
}
  
function howManyBytes(val) {
  if(val === 0) { return 1; }
  return Math.ceil(howManyBits(val) / 8);
}

function maxFromBits(val) {
  return Math.ceil(Math.pow(2, val) - 1);
}

function maxFromBytes(val) {
  return Math.ceil(maxFromBits(8 * val));
}

function isBits(bits) {
  return function(val) {
    if(isNatural(val)) {
      return howManyBits(val) <= bits;
    } else if(_(val).isString() && Pattern.test(val)) {
      if(bits <= 52) {
        val = parseInt(val);
        return val <= maxFromBits(bits);
      } else if (/^0x/.test(val)) {
        
      }
    }
    return false;
  };
}

//var isUInt8  = isBits(8);
//var isUInt16 = isBits(16);
//var isUInt32 = isBits(32);

function normalizeNumber(val) {
  var bits = howManyBits(val);
  var bytes = howManyBytes(val);
  var value;
  if(bits <= 32) {
    value = val;
  } else {
    value = _(bytes).times(function(idx) {
      var result = val % 256;
      val = Math.floor(val / 8);
      return result;
    });
  } 
  return {
    value: value,
    bits:  (bits % 8),
    bytes: Math.floor(bits / 8)
  };
}

function normalizeArray(vals) {
  // FIXME: maybe being too clever
  //var bits = howManyBits(vals[0]) % 8;
  var bits = 0;
  var bytes = bits > 0 ? vals.length - 1 : vals.length;
  return {
    value: vals,
    bits:  bits,
    bytes: bytes
  };
}

function normalizeString(str) {
  var result = parseInt(str);
  if(_(result).isNaN()) {
    throw 'Cannot normalize string, must be a valid unsigned integer: ' + str;
  }
  if(howManyBits(result) > 52) {
    if(/^0x/.test(str)) {
      // chop off the hex prefix
      str = str.substr(2);
      // build an array of converted hex pairs
      result = [];
      for(var i = str.length - 1; i > 0; i -= 2) {
        result.splice(0, 0, parseInt(str.substr(i-1, 2), 16));
      }
      // add a leading zero on odd length hex strings
      if(str.length % 2 !== 0) {
        result.splice(0, 0, 0);
      }
      return normalizeArray(result);
    } else {
      throw 'Cannot normalize string, large value must be hex: ' + str;
    }
  } else {
    return normalizeNumber(result);
  }
}

function normalize(value) {
  if(isNatural(value) && howManyBits(value) <= 52) {
    return normalizeNumber(value);
  } else if(_(value).isArray() && 
            _(value).every(function(val) { 
                return isNatural(val) && val < 256;
            })) {
    return normalizeArray(value);
  } else if(_(value).isString()) {
    return normalizeString(value);
  } else {
    throw 'Cannot normalize value: ' + value;
  }
}

// FIXME old version memoizes 'HEX' if used to set
function UInt(args) {
  // Assign default valus
  this._value = null;
  this._bytes = null;
  this._bits  = null;
  // Set constraints if present
  if(args && (isNatural(args.bits) || isNatural(args.bytes))) {
    // Set the size if either is used
    this._bits  = args.bits  || 0;
    this._bytes = args.bytes || 0;
    // Normalize the byte/bit counts
    this._bytes += Math.floor(this._bits / 8);
    this._bits = this._bits % 8;
  }
  // Set the value and check if present
  if(args && (_(args.value).isNumber() || _(args.value).isString() || _(args.value).isArray())) {
    var result = normalize(args.value);
    this._value = result.value;
    // Set the sizes or validate if present
    if(_(this._bytes).isNull() && _(this._bits).isNull()) {
      this._bytes = result.bytes;
      this._bits  = result.bits;
    } else if(this._bytes < result.bytes || 
             (this._bytes === result.bytes && this._bits < result.bits)) {
      throw 'Value is larger than size constraints: ' + args.value + ' ' + this._bytes + ':' + this._bits;
    }
    // Insert any necessary leading zeros
    if(_(this._value).isArray()) {
      _(this._bytes - this._value.length).times(function() {
        this._value.splice(0, 0, 0);
      }, this);
    }
  }
}

function assertSame(op, lhs, rhs) {
  if(lhs._bits !== rhs._bits || lhs._bytes !== rhs._bytes || 
     (typeof lhs._value) !== (typeof rhs._value)) {
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
    // FIXME handle overflow
    this._value = normalize(value);
  } else {
    return this._value;
  }
};

UInt.prototype.toString = function(base, sep) {
  var prefix = base && base === 16 ? '0x' : '';
  var delim  = sep || '';
  var result;
  if(_(this._value).isNumber()) {
    if(base === 16) {
      var halfOctets = 2 * this._bytes + Math.ceil(this._bits / 4);
      result = padZeros(this._value.toString(base), halfOctets); 
    } else {
      result = this._value.toString(base);
    }
  } else {
    result = _(this._value).map(function(v) {
      return padZeros(v.toString(base), 2);
    }).join(delim);
  }
  return prefix + result;
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
  return this;
};

UInt.prototype.clone = function() {
  var result = new UInt();
  return result.copy(this);
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
    this._value = (mask & ~this._value) >>> 0;
  } else {
    this._value = _(this._value).map(function(v) {
      return 0xff & (~v) >>> 0;
    });
  }
  return this;
};

UInt.prototype.mask = function(src, mask) {
  this.copy(or(and(this, neg(mask)), and(src, mask)));
  /*  FIXME - this operation should just be a cmposition
  if(_(this._value).isNumber()) {
    this._value = ((this._value & ~mask._value) | (src._value & mask._value)) >>> 0;
  } else {
    this._value = _.map(_.zip(this._value, src._value, mask._value),
      function(triple) {
        return ((triple[0] & ~triple[2]) | (triple[1] & triple[2])) >>> 0;
      });
  }
  */
  return this;
};

UInt.prototype.match = function(src, mask) {
  return equal(this, and(src, mask));
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
    for(var idx = 0; idx < this._value.length; ++idx) {
      if(this._value[idx] < rhs._value[idx]) {
        return true;
      }
    }
    return false;
  }
};

UInt.prototype.lessEqual = function(rhs) {
  return this.less(rhs) || this.equal(rhs);
};

UInt.prototype.greater = function(rhs) {
  return rhs.less(this);
};

UInt.prototype.greaterEqual = function(rhs) {
  return this.greater(rhs) || this.equal(rhs);
};

UInt.prototype.lshift = function(amt) {
  //FIXME implement
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

UInt.prototype.rshift = function(amt) {
  //FIXME implement
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

UInt.prototype.plus = function(rhs) {
  assertSame('plus', this, rhs);
  //FIXME implement
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

UInt.prototype.minus = function(rhs) {
  assertSame('minus', this, rhs);
  //FIXME implement
  if(_(this._value).isNumber()) {
  } else {
  }
  return this;
};

function and(lhs, rhs) {
  var result = lhs.clone();
  return result.and(rhs);
}

function or(lhs, rhs) {
  var result = lhs.clone();
  return result.or(rhs);
}

function xor(lhs, rhs) {
  var result = lhs.clone();
  return result.xor(rhs);
}

function neg(lhs) {
  var result = lhs.clone();
  return result.neg();
}

function mask(lhs, src, msk) {
  var result = lhs.clone();
  return result.mask(src, msk);
}

function equal(lhs, rhs) {
  return lhs.equal(rhs);
}

function notEqual(lhs, rhs) {
  return lhs.notEqual(rhs);
}

function less(lhs, rhs) {
  return lhs.less(rhs);
}

function lessEqual(lhs, rhs) {
  return lhs.lessEqual(rhs);
}

function greater(lhs, rhs) {
  return lhs.greater(rhs);
}

function greaterEqual(lhs, rhs) {
  return lhs.greaterEqual(rhs);
}

function plus(lhs, rhs) {
  var result = lhs.clone();
  return lhs.plus(rhs);
}

function minus(lhs, rhs) {
  var result = lhs.clone();
  return lhs.minus(rhs);
}

function lshift(lhs, rhs) {
  var result = lhs.clone();
  return result.lshift(rhs);
}

function rshift(lhs, rhs) {
  var result = lhs.clone();
  return result.rshift(rhs);
}

function copy(uint) {
  var result = new UInt();
  result.copy(uint);
  return result;
}

function fromJSON(json) {
  var result = new UInt();
  result.fromJSON(json);
  return result;
}

function toString(uint) {
  return uint.toString();
}

function toJSON(uint) {
  return JSON.stringify(uint);
}

function match(tgt, src, mask) {
  return tgt.match(src, mask);
}

var Symbols = {
  // Utility Funcionts
  isInteger:    isInteger,
  isNatural:    isNatural,
  padZeros:     padZeros,
  howManyBits:  howManyBits,
  maxFromBits:  maxFromBits,
  howManyBytes: howManyBytes,
  maxFromBytes: maxFromBytes,
  // Unsigned integer type
  UInt:     UInt,
  // Lifecycle operations
  copy:     copy,
  fromJSON: fromJSON,
  // Unsigned integer serializers
  toString: toString,
  toJSON:   toJSON,
  // Equality operations
  equal:    equal,
  notEqual: notEqual,
  // Relational operations
  less:         less,
  lessEqual:    lessEqual,
  greater:      greater,
  greaterEqual: greaterEqual,
  // Logical bitwise operations
  and:    and,
  or:     or,
  xor:    xor,
  neg:    neg,
  mask:   mask,
  lshift: lshift,
  rshift: rshift,
  match:   match,
  // Arithmetic operations
  plus:  plus,
  minus: minus
};

if(typeof exports !== 'undefined') {
  if(typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Symbols;
  } else {
    exports.UInt = Symbols;
  }
  _ = require('underscore');
} else {
  root.UInt = Symbols;
  _ = root._;
}

if(typeof define === 'function' && define.amd) {
  define('UInt', ['underscore'], function(underscore) {
    _ = underscore;
    return Symbols; 
  });
} 

}.call(this));
