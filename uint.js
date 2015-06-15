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
        return true;
      }
    }
    return false;
  };
}
/*
 * function is(bits) {
 *   return function(val) {
 *     // Test the numeric range if a number
 *     if(_.isFinite(val) && (val % 1 === 0)) {
 *       return 0 <= val && val <= maxFromBits(bits);
 *       // Othrwise validate is an actual string
 *     } else if(_(val).isString() && Pattern.test(val)) {
 *       // Check is simple range check if under 32 bits
 *       if(bits <= 32) {
 *         val = parseInt(val);
 *         return val <= maxFromBits(bits);
 *       // If over 32 bits its a little more complex
 *       } else {
 *         // Allow zero without '0x' prefix
 *         if(val === '0') { return true; }
 *         // Otherwise require the '0x' prefix for > 32 bit values
 *           if(!/^0x/.test(val)) { return false; }
 *           // Remove the '0x' prefix
 *           val.splice(0, 2);
 *           // Technically this will not be accurate for bit counts with
 *           // modulo 1, 2, and 3 .... FIXME
 *           return val.length <= Math.ceil(bits/4);
 *         }
 *       }
 *       return false;
 *     };
 *   }
 */

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
      val = Math.floor(val / 256);
      return result;
    }).reverse();
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
  this._isHex = false;
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
  if(args && (_(args.value).isNumber() || _(args.value).isString() || 
              _(args.value).isArray())) {
    var result = normalize(args.value);
    this._value = result.value;

    // Set the sizes or validate if present
    if(_(this._bytes).isNull() && _(this._bits).isNull()) {
      this._bytes = result.bytes;
      this._bits  = result.bits;
    } else if(this._bytes < result.bytes || 
             (this._bytes === result.bytes && this._bits < result.bits)) {
      throw 'Value is larger than size constraints: ' + args.value + ' ' + 
             this._bytes + ':' + this._bits;
    }
    // Insert any necessary leading zeros
    if(_(this._value).isArray()) {
      _(this._bytes - this._value.length).times(function() {
        this._value.splice(0, 0, 0);
      }, this);
    // Handle the case of user supplied array boundary but small value
    } else if(this._bytes > 4) {
      var tmp = [];
      _(this._bytes).times(function(i) {
        if(i < 4) {
          tmp.splice(0, 0, this._value % 256);
          this._value = Math.floor(this._value / 256);
        } else {
          tmp.splice(0, 0, 0);
        }
      }, this);
      this._value = tmp;
    }
  }

  //Set isHex if string starts with 0x
    if(args && _(args.value).isString()){
      var arr = args.value.match(/^0x/i);
      if(arr !== null){
        this._isHex = true;
      }  
      else{
        this._isHex = false;
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
    var result = normalize(value);
    if(result.bytes > this._bytes || result.bits > this._bits) {
      throw 'Value is larger than size constraints: ' + value + ' ' +
            this._bytes + ':' + this._bits;
    }
    this._value = result.value;
  } else {
    return this._value;
  }
};

 UInt.prototype.isHex=function(){
  return this._isHex;
};

UInt.prototype.zero = function() {
  if(_(this._value).isNumber()) {
    this._value = 0;
  } else {
    this._value = _(this._value).map(function(val) { return 0; });
  }
};

UInt.prototype.toString = function(base, sep) {
  var prefix;
  if(base && base === 16 || this._isHex) {
    prefix = '0x';
    base = 16;
  } else {
    prefix = '';
  }
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
  this._isHex = uint._isHex;
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
  if(_(json).isString()){
    json = JSON.parse(json);
  }
  _(this).extend(json);
};

UInt.prototype.fromBuffer = function(buffer, consume) {
  //FIXME
  if(this._bytes > 4 ) {
  } else {
  }
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
  /*  FIXME - this operation should just be a composition, once the above is
   *  validated remove what is below
   *  *********
   *
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
    this._value = this._value << amt;
  } else {
  }
  return this;
};

UInt.prototype.rshift = function(amt) {
  //FIXME implement
  if(_(this._value).isNumber()) {
    this._value = this._value >> amt;
  } else {
  }
  return this;
};

UInt.prototype.plus = function(rhs) {
  assertSame('plus', this, rhs);
  //FIXME implement
  if(_(this._value).isNumber()) {
    this._value += rhs._value;
  } else {
  }
  return this;
};

UInt.prototype.minus = function(rhs) {
  assertSame('minus', this, rhs);
  //FIXME implement
  if(_(this._value).isNumber()) {
    this._value -= rhs._value;
  } else {
    /*  old code ... redo
    var b = [0,0,0,0,0,0];
    _(this.value).each(function(di, idx){
      var idxn = this.value.length - 1 - idx;
      this.value[idxn] -= b[idxn];
      this.value[idxn] -= sub.value[idxn];
      if(this.value[idxn] < 0){
        b[idxn - 1] = this.value[idxn] * -1;
        this.value[idxn] = 255 | -(this.value[idxn]);
      }
    }, this);
    */
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

function fromBuffer(buf, bits, consume){
  var result = new UInt({bits: bits});
  return result.fromBuffer(buf, consume);
}

function toString(uint, base, sep) {
  return uint.toString(base, sep);
}

function dispString(){
  return function(uint){
    return uint.toString(16);
  };
}

function toJSON(uint) {
  return JSON.stringify(uint);
}

function match(tgt, src, mask) {
  return tgt.match(src, mask);
}

function Match(args) {
  this.value = copy(args.value);
  this.mask  = copy(args.mask);
  if(this.value.isValid() && this.mask.isValid()) {
    this.value.and(this.mask);
  }
}

Match.prototype.copy = function(match) {
  this.value = copy(match.value);
  this.mask  = copy(match.mask);
  return this;
};

Match.prototype.clone = function() {
  var result = new Match();
  result.copy(this);
  return result;
};

Match.prototype.fromJSON = function(json) {
  this.copy(JSON.parse(json));
  return this;
};

Match.prototype.equal = function(rhs) {
  return equal(this.value, rhs.value) && equal(this.mask, rhs.mask);
};

Match.prototype.notEqual = function(rhs) {
  return !(this.equal(rhs));
};

Match.prototype.match = function(value) {
  return equal(this.value, and(this.mask, value));
};

Match.prototype.toString = function(base) {
  return this.value.toString(base) + '/' + this.mask.toString(base);
};

function makeExactMatch(value) {
  var zero = new UInt({ value: 0, bits: value._bits, bytes: value._bytes });
  return new Match({
    value: copy(value),
    mask: zero.neg()
  });
}

function makeAllMatch(args) {
  var zero = new UInt({ value: 0, bits: args._bits, bytes: args._bytes });
  return new Match({
    value: args,
    mask: zero
  });
}

function mk(byts, val){
  var result = new UInt({ bytes: byts, value: parseInt(val)});
  return result;
}

// Construct a function that converts a string to a value with a specific
// underlying bit precision. If the bit precision is 32 or less, the result
// is a natural number. If the bit precision is greater than 32, the result
// is an array of natural numbers where each cell is [0..255].
//
// consStr :: String -> Nat | [Nat] if bits > 32
//

function consStr(bits) {
  return function(value) {
    var uint = new UInt({ bits: bits, value: value });
    return uint;
  };
}

/*
function consStr(bits) {
  var bytes = Math.ceil(bits / 8);
  var hbytes = Math.ceil(bits / 4);
  return function(val) {
    var i, tmp;
    var array = [];
    // We should not have bad input at this point
    if(!Pattern.test(val)) {
      throw 'Bad consStr('+bits+')('+val+')';
    }
    // Return the value if the precision is 32 or under
    tmp = parseInt(val);
    if(tmp <= maxFromBits(32) && bits <= 32) {
      return tmp;
    } 
    // Throw an execption if the value is too large for the precision
    if(bits <= 32) {
      throw 'Bad consStr('+bits+')('+val+')';
    }
    // Return the easy case of 0
    if(tmp === '0') {
      return _(bytes).range(function() {
        return 0;
      });
    } 
    // Otherwise must be hex 
    // OR val is less than maxFromBits(32)
    if(Pattern.test(val)) {
      if(!/^0x/.test(val)){
        val = parseInt(val).toString(16);
      }
      tmp = val.split('');

      if(/^0x/.test(val)){
      // Chop the '0x' prefix for easier handling
      tmp.splice(0, 2);
      }
      // Input is larger than allowable
      if(tmp.length > hbytes) {
        throw 'Bad consStr('+bits+')('+tmp+')';
      }
      // Work from the back of the input
      tmp.reverse();

      for(i=0; i<bytes; ++i) {
        // We are out of input just return a 0
        if(tmp.length === 0) {
          array.push(0);
        // We only have a half-octect of input
        } else if(tmp.length === 1) {
          // parse just a half-octect and remove
          array.push(parseInt(tmp.splice(0, 1), 16));
        // Otherwise we have a full octet of input
        } else {
          // parse a full octect and remove
          array.push(parseInt(tmp.splice(0, 2).reverse().join(''), 16));
        }
      }
      // Fix the array orientation and return
      array.reverse();
      return array;
    } else {
      // We don't know what it is ... hard fail
      throw 'Bad consStr('+bits+')('+val+')';
    }
  };
}
*/

var Symbols = {
  // Utility Funcionts
  is:           isBits,
  isInteger:    isInteger,
  isNatural:    isNatural,
  padZeros:     padZeros,
  howManyBits:  howManyBits,
  maxFromBits:  maxFromBits,
  howManyBytes: howManyBytes,
  maxFromBytes: maxFromBytes,
  consStr:      consStr,
  // Unsigned integer type
  UInt:     UInt,
  mk:       mk,
  // Lifecycle operations
  copy:     copy,
  fromJSON: fromJSON,
  fromBuffer: fromBuffer,
  // Unsigned integer serializers
  toString: toString,
  toJSON:   toJSON,
  dispString: dispString,
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
  minus: minus,
  // UInt Match Type
  Match: Match,
  // Match factories
  makeAllMatch:   makeAllMatch,
  makeExactMatch: makeExactMatch
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
