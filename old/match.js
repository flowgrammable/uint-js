
function Match(match, value, mask) {
  if(_.isObject(match)) {
    this.value = new UInt(match.value);
    this.mask  = new UInt(match.mask);
  } else if(value.bytes === mask.bytes) {
    this.value = new UInt(value);
    this.mask  = new UInt(mask);
    this.value = this.value.and(this.mask);
  } else {
    throw 'Match('+match+', '+value+', '+mask+')';
  }
}

Match.prototype.clone = function() {
  return new Match(this);
};

Match.prototype.toString = function(base) {
  return this.value.toString(base) + '/' + this.mask.toString(base);
};

Match.prototype.equal = function(match) {
  return equal(this.value, match.value) && equal(this.mask, match.mask);
};

Match.mkWildcard = function(uint) {
  var bytes;
  if(uint instanceof UInt) {
    bytes = uint.bytes;
  } else {
    bytes = uint;
  }
  return new Match(null,
    new UInt(null, null, bytes),
    new UInt(null, null, bytes));
};

Match.mkExact = function(uint) {
  return new Match(null,
    uint,
    (new UInt(null, null, uint.bytes)).neg());
};

Match.prototype.match = function(val) {
  if(this.value.bytes !== val.bytes) {
    throw 'Match.match('+this.value.bytes+', '+val.bytes+')';
  } else if(this.value.bytes < 5) {
    return ((val.value & this.mask.value) >>> 0) === this.value.value;
  } else {
    return _.reduce(_.zip(val.value, this.mask.value, this.value.value),
      function(pass, triple) {
        return !pass ? false : ((triple[0] & triple[1]) >>> 0) === triple[2];
      }, true);
  }
};

