Co-Op provides Pythonic cooperative multiple inheritance to Javascript and Node.js.

Installation
===========

```
npm install coop
```

Usage
=====
Creating a class is similar to Mootools:

```javascript
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
    this.super(me);
  }
})
```
