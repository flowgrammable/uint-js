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



##Equality operations/functions

##Relational operations/functions

##Logical bitwise operations/functions

##Arithmetic operations/functions
