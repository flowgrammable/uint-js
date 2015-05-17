#UInt

This is a simple javascript library for handing a subset of operations on a
precise width unsigned integer type. We developed this library to aid in working
with low-level network and device types. It is not an arbitrary precision
integer library. However, if you are dealing with network addresses, performing
route lookups, or attempting bitwise logical operations over a range of unsigned
integer widths this library may be helpful for you.

###Sample Usage
```
var Broadcast = new UInt({ bits: 48});  // Ethernet MAC address
Braodcast.value('0xffffffffffff');      // Set to the Braodcast address
console.log(MAC.toString());            // Output the string version

// IPv4 network and mask address, construct using values or strings
var route = new UInt({ bits: 32, value: 0x0a000000 });
var mask = new UInt({ bits: 32, value: '0xffffff00' });

// IPv4 packet destination address
var ip = new UInt({ bits: 32, value: 0x0a00000a });

// Perform a route comparison
if(ip.and(mask).equal(route))   { ... }
if(equal(route, and(ip, mask))) { ... }

// IPv6 Address
var IPv6 = new UInt({ bits: 128 });
```

###Development Setup
- Prerequisites: 
    - Install Node or IO.js
    - Install Grunt globally - ```sudo npm install -g grunt-cli```
- Dependencies: 
    - Install local dependencies - ```npm install```
- Tests:
    - Execute unit tests - ```grunt```

##Types Supported
- UInt - unsigned integer with arbitrary bit/byte precision
- Match - pair of UInt, value and mask, useful for bitstring matching

##Type Operations Supported
- Constructors: default, copy, fromJSON
- Equality: equal, notEqual
- Relational: less, lessEqual, greater, greaterEqual
- Logical bitwise: and, or, xor, neg, mask, lshift, rshift
- Arithmetic: plus, minus

##Functions Supported
- Validation: is
- Equality: equal, notEqual
- Relational: less, lessEqual, greater, greaterEqual
- Logical bitwise: and, or, xor, neg, mask, lshift, rshift
- Arithmetic: plus, minus
- Uitility: howManyBits, howManyBytes, maxFromBits, maxFromBytes

##Exceptions Generated

##Internal Storage

#Details

##Construction

The UInt constructor can take an object as a paramter. The object can have
three properties: bits, bytes, and value. If bits or bytes are specified the
constructed UInt will be bounded by this precise width. The value may be a 
number, string, or array of numbers. If no value is provided the UInt is
initialized to an invalid state; this is useful for deserialization from: JSON,
memory, file, socket, etc. If bits and bytes are omitted the width of the object
is fixed to the maximum width necessary to contain the provided value; otherwise
the object is constructed in an invalid state.

```
// no boundary width, invalid state
new UInt();                       

// Construct with boundary widths
// .. but defer setting values
new UInt({ bits: 4 });            // 4 bit width, invalid state
new UInt({ bytes: 4 });           // 4 byte width, invalid state
new UInt({ bits: 4, bytes: 2 });  // 20 bit width, invalid state
new UInt({ bits: 48 });           // 48 bit | 6 byte width, invalid state

// Consturct using numbers, strings, or arrays
new UInt({ value: 0 });
new UInt({ value: 0x0f0f0f0f });
new UInt({ value: '0x0f0f0f0f });
new UInt({ value: [ 1, 0, 0, 0, 0, 0, 0, 0, 0 ] });
```

##Equality operations/functions
Equality and inequality methods and functions are provided for the UInt type.
```
if(x.equal(y))     { console.log("x = y"); }
if(equal(x, y))    { console.log("x = y"); }
if(x.notEqual(y))  { console.log("x != y"); }
if(notEqual(x, y)) { console.log("x != y"); }
```

##Relational operations/functions
Standard relational methods and functions are provided for the UInt type.

```
if(x.less(y)           { console.log("x < y");  }
if(less(x, y)          { console.log("x < y");  }
if(x.lessEqual(y)      { console.log("x <= y"); }
if(lessEqual(x, y)     { console.log("x <= y"); } 
if(x.greater(y))       { console.log("x > y");  }
if(greater(x, y))      { console.log("x > y");  }
if(x.greaterEqual(y))  { console.log("x >= y"); }
if(greaterEqual(x, y)) { console.log("x >= y"); }
```

##Logical bitwise operations/functions
Standard logical bitwise methods and functions are provided for the UInt type.
These operations only work for UInt's of the same precision. If the calling 
parameters of either function or mether do not have the bit and byte width, then
an exception is generated.
```
return x.and(y);        // Performs a &= and returns this
return and(x, y);       // Constructs UInt, assigns x & y, returns new UInt
return x.or(y);         // Performs a |= and returns this
return or(x, y);        // Constructs UInt, assigns x | y, returns new UInt
return x.xor(y);        // Performs a ^= and returns this
return xor(x, y);       // Constructs UInt, assigns x ^ y, returns new UInt
return x.neg();         // Performs a ~= and returns this
return neg(x);          // Constructs UInt, assigns ~x, returns new UInt
return x.lshift(4);     // FIXME: not implemented
return lshift(x, 4);    // FIXME: not implemented
return x.rshift(4);     // FIXME: not implemented
return rshift(x, 4);    // FIXME: not implemented
```

##Arithmetic operations/functions
Plus and minus arithmetic methods and functions are provided for the UInt type.
These operations only work for UInt's of the same precision. If the calling 
parameters of either function or mether do not have the bit and byte width, then
an exception is generated.
```
return x.plus(y);       // FIXME: not implemented
return plus(x, y);      // FIXME: not implemented
return x.minus(y);      // FIXME: not implemented
return minus(x, y);     // FIXME: not implemented
```
