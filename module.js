(function() {

var root = this;
var prevUInt = root.UInt;

// Create a safe reference to the Underscore object for use below.
var UInt = {};

UInt.id = function(id) { return id; }
  
// Export the Underscore object for **Node.js**, with
// backwards-compatibility for their old module API. If we're in
// the browser, add `_` as a global object.
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = UInt;
  }
  exports.UInt = UInt;
} else {
  root.UInt = UInt;
}

// Inject for AMD 
if (typeof define === 'function' && define.amd) {
  define('UInt', [], function() {
    return UInt;
  });
}

}.call(this));
