Co-Op provides Pythonic cooperative multiple inheritance to Javascript and Node.js.

[![Build Status](https://travis-ci.org/tehsenaus/coop-js.png)](https://travis-ci.org/tehsenaus/coop-js)

Installation
===========

```
npm install coop
```

Usage
=====
Creating a class is similar to Mootools:

```javascript
var Class = require('coop').Class;
var MyClass = new Class({
  initialize: function(me) {
    this.me = me;
  }
});
```

Inheritance
-----------

...is a little different from Mootools. But orders of magnitude more powerful.

```javascript
var MySubClass = new Class([MyClass, MyOtherClass], {
  initialize: function (me) {
    this.super_initialize(MySubClass, arguments);
  }
})
```


Metaclasses
-----------

Make your own subclass of Class, and override __new__, just like you do in Python:

```javascript
var MyMetaClass = new Class([Class], {
  __new__: function (klass) {
    var instance = this.super___new__(MyMetaClass, arguments);

    registerMyClass( instance );

    return instance;
  }
})

var MyClass = new MyMetaClass({
  initialize: function () { /* ... */ }
})

```
