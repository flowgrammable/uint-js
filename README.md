# UInt

This is a simple javascript library for handing a subset of operations on a
precise width unsigned integer type. We developed this library to aid in working
with low-level network and device types. It is not an arbitrary precision
integer library. However, if you are dealing with network addresses, performing
route lookups, or attempting bitwise logical operations over a range of unsigned
integer widths this library may be helpful for you.

### Sample Usage
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

### Development Setup
- Prerequisites: 
    - Install Node or IO.js
    - Install Grunt globally - ```sudo npm install -g grunt-cli```
- Dependencies: 
    - Install local dependencies - ```npm install```
- Tests:
    - Execute unit tests - ```grunt```

## Types Supported
- UInt - unsigned integer with arbitrary bit/byte precision
- Match - pair of UInt, value and mask, useful for bitstring matching

## Type Operations Supported
- Constructors: default, copy, fromJSON
- Equality: equal, notEqual
- Relational: less, lessEqual, greater, greaterEqual
- Logical bitwise: and, or, xor, neg, mask, lshift, rshift
- Arithmetic: plus, minus

## Functions Supported
- Validation: is
- Equality: equal, notEqual
- Relational: less, lessEqual, greater, greaterEqual
- Logical bitwise: and, or, xor, neg, mask, lshift, rshift
- Arithmetic: plus, minus
- Uitility: howManyBits, howManyBytes, maxFromBits, maxFromBytes

## Exceptions Generated
The UInt facilities will generate an exception under three conditions:
construction, internal value mutation, and binary operations/functions. 

An exception is generated during construction if the supplied value requires 
more bit/byte storage than has been specified with the bit/byte construction
parameters. Or construction can generate an exception if the supplied value is
not convertable to an unsigned integer. Mutating the internal value of a UInt
will generate the same types of exceptions as construction.

The supplied UInt binary operators can also generate exceptions. All of the
binary operations that return a UInt type will generate an exception if the two
supplied operands do not have the same bit/byte width.

Exceptions are currently explantory strings; they should be refactored into
distinct exception objects for easier catch handling.

## Internal Storage

The UInt object stores the successfully constructed unsigned integer value in
the `_value` property. The type of this property is either a number or an array
of numbers. The reason for the non-uniform storage type is due to javascript's
handling of numbers.

Javascript treats all numbers (reals, naturals, integers) as real
numbers that it can store in a 64 bit floating point register. Integers up to
2^52 -1 can be safely stored in this register without loss of precision.
However, javascript's logical bitwise operators only work on 32 bit integer
representations. This means that for integers that can be stored in 32 bits or 
less, a javascript number type will work. However, for all larger integers an 
alterantive representational type is needed.

The UInt library stores all values that can be represented with a 32 bit
register as a javascript number, otherwise the value is stored in a javascript
array of numbers where each array cell is an 8 bit value. It might be more
efficient to store large representations in each cell of an array; however, for
expediency we chose an 8 bit representation.

If you review our code you will see all UInt methodes will typically test the
type of the `_value` property for either `Number` or `Array`, and perform a
slightly different computation accordingly. This is to handle the alternative
internalized representation of unsigned integers.

## Construction

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

var x = uint.copy();  // copy construct a new UInt object, as a method
var x = copy(uint);   // copy construct a new UInt object, as a funciton

// Copy construct a new UInt object, from a json representation, as a function
var x = fromJSON(JSON.stringify(uint)); 
```

## Accessor operations
The internalized unsigned integer value can be accesses through the value
method. Providing a parameter to this function will attempt a mutation of the
internal value, while omitting the parameter will just get the interalized
value.
```
console.log(x.value());       // Access the internalized UInt value
x.value(0xffffffffffff);      // Mutate the internalized UInt value
```

## Serializtion operations/functions
A UInt object can be serialized to either a string or a JSON string.
```
// UInt method versions of toString
console.log(uint.toString());           // decimal string representation
console.log(uint.toString(16));         // hex string representation
console.log(uint.toString(16, ':'));    // hex rep. with inter-byte separator

// Function versions of toString
console.log(toString(uint));            // decimal string representation
console.log(toString(uint, 16));        // hex string representation
console.log(toString(uint, 16, ':'));   // hex rep. with inter-byte separator 

// Return a JSON representation of the object
return toJSON(uint);
```

## Equality operations/functions
Equality and inequality methods and functions are provided for the UInt type.
All equality methods/functions return a boolean.
```
if(x.equal(y))     { console.log("x = y"); }
if(equal(x, y))    { console.log("x = y"); }
if(x.notEqual(y))  { console.log("x != y"); }
if(notEqual(x, y)) { console.log("x != y"); }
```

## Relational operations/functions
Standard relational methods and functions are provided for the UInt type. All
relational methods/functions return a boolean;

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

## Logical bitwise operations/functions
Standard logical bitwise methods and functions are provided for the UInt type.
These operations only work for UInt's of the same precision. If the calling 
parameters of either function or mether do not have the bit and byte width, then
an exception is generated. All logical bitwise methods return the `this`
reference, all logical bitwise functions return a new UInt object.
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

## Arithmetic operations/functions
Plus and minus arithmetic methods and functions are provided for the UInt type.
These operations only work for UInt's of the same precision. If the calling 
parameters of either function or mether do not have the bit and byte width, then
an exception is generated. All arithmetic methods return the `this` reference, 
all arithmetic functions return a new UInt object.
```
return x.plus(y);       // FIXME: not implemented
return plus(x, y);      // FIXME: not implemented
return x.minus(y);      // FIXME: not implemented
return minus(x, y);     // FIXME: not implemented
```

## Utility operations/funcitons
These are operations that we use through the UInt library. They primarily deal
with data representational properties.
```
return howManyBits(0x1ffff);    // minimum number of bits needed to store value
return howManyBytes(0x1ffff);   // minimum number of bytes needed to store value
return maxFromBytes(6);         // maximum value storage in X bytes
return maxFromBits(48);         // maximum value storage in X bits
return isBits(16);              // FIXME: not implemented
```
