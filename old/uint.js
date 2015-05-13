
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

