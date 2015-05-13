
function is(bits) {
  return function(val) {
    // Test the numeric range if a number
    if(_.isFinite(val) && (val % 1 === 0)) {
      return 0 <= val && val <= maxFromBits(bits);
    // Othrwise validate is an actual string
    } else if(_(val).isString() && Pattern.test(val)) {
      // Check is simple range check if under 32 bits
      if(bits <= 32) {
        val = parseInt(val);
        return val <= maxFromBits(bits);
      // If over 32 bits its a little more complex
      } else {
        // Allow zero without '0x' prefix
        if(val === '0') { return true; }
        // Otherwise require the '0x' prefix for > 32 bit values
        if(!/^0x/.test(val)) { return false; }
        // Remove the '0x' prefix
        val.splice(0, 2);
        // Technically this will not be accurate for bit counts with
        // modulo 1, 2, and 3 .... FIXME
        return val.length <= Math.ceil(bits/4);
      }
    }
    return false;
  };
}

// Construct a function that converts a string to a value with a specific
// underlying bit precision. If the bit precision is 32 or less, the result
// is a natural number. If the bit precision is greater than 32, the result
// is an array of natural numbers where each cell is [0..255].
//
// consStr :: String -> Nat | [Nat] if bits > 32
//
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

// Construct a funtion that converts either a natural number or array of natural
// numbers to a user display string.
//
// toString :: Nat | [Nat] -> String
//
function toString(bits) {
  return function(value, isHex) {
    if(_(value).isArray()) {
      return '0x'+_(value).map(function(octet) {
        return padZeros(octet.toString(16), 2);
      }).join('');
    } else if(_(value).isFinite()) {
      if(isHex) {
        return '0x'+padZeros(value.toString(16), 2*(bits/8));
      } else {
        return value.toString(10);
      }
    } else {
      throw 'toString on bad value: '+value;
    }
  };
}

function UInt(uint, value, bytes) {
  if(_.isObject(uint)) {
    if(uint.bytes > 4) {
      this.value = _.clone(uint.value);
    } else {
      this.value = uint.value;
    }
    this.bytes = uint.bytes;
    this.isHex = uint.isHex;
  } else if(_.isString(value) && Pattern.test(value) && bytes) {
    if(isHexStr(value)){
      this.isHex = true;
    }
    if(bytes < 5) {
      this.value = parseInt(value);
    } else {
      // Cannot construct from string for larger than 4 bytes
      throw 'UInt('+uint+', '+value+', '+bytes+')';
    }
    this.bytes = bytes;
  } else if(_.isArray(value)) {
    this.value = value;
    this.bytes = bytes ? _.max([bytes, value.length]) : value.length;
    this.isHex = true;
  } else if(_.isFinite(value) && (value % 1 === 0) && (bytes < 5)) {
    this.value = value;
    this.bytes = bytes ? bytes : 4;
    this.isHex = false;
  } else if((_.isUndefined(value) || _.isNull(value) || value === 0) && bytes >= 0) {
    if(bytes < 5) {
      this.value = 0;
      this.bytes = bytes;
      this.isHex = false;
    } else {
      this.value = _(bytes).times(function() { return 0; });
      this.bytes = bytes;
      this.isHex = true;
    }
  } else {
    throw 'UInt('+uint+', '+value+', '+bytes+')';
  }
  // If converted value is wider than limit throw exception
  if(this.bytes < 5 && howManyBytes(this.value) > this.bytes) {
    throw 'UInt('+uint+', '+value+', '+bytes+')';
  } else if(this.bytes > 4 && this.value.length > this.bytes) {
    throw 'UInt('+uint+', '+value+', '+bytes+')';
  }
  // If converted value is negative, throw exception
  // warning: can only check 1, 2, 3 byte uints for negativity...
  if (this.bytes < 4 && this.value < 0) {
    throw 'UInt('+uint+', '+value+', '+bytes+')';
  }
}

UInt.prototype.subt = function(sub){
  if(!this.greaterThan(sub)){
    throw 'UInt must be greater than sub';
  }
  if(this.bytes < 5){
    this.value -= sub.value;
  } else {
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
  }
  return this;
};

