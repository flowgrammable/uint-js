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

function howManyBits(val) {
  if(val === 0) { return 1; }
  return Math.floor((Math.log(val) / Math.LN2) + 1);
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

function UInt(args) {
  this._bytes = args ? args.bytes : null;
  this._bits  = args ? args.bits  : null;
  this._value = normalize(value) || null;
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

UInt.prototype.isValid = function() {
  return this.value !== null;
};

UInt.prototype.copy = function(uint) {
};

UInt.prototype.toView = function(view) {
};

UInt.prototype.fromView = function(view) {
};

UInt.prototype.toJSON = function() {
};

UInt.prototype.fromJSON = function(json) {
};

})();
