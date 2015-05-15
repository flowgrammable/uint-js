
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

