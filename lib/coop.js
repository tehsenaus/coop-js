
var coop = module.exports = {};

function makeArray(a) {
	return a instanceof Array ? a : [a];
}

function merge(a) {
	var lin = [];
	while(a.length) {
		
		var head = null;
		for(var i = 0; i < a.length; i++) {
			var h = a[i][0];
			if(!a.some(function(b) {
				return b.indexOf(h) > 0;
			}))
			{
				head = h;
				break;
			}
		}
		if(!head) {
			throw new Error("No linearization possible for " + a.join(','));
		}
		
		lin.push(head);
		
		a = a.map(function (b) {
			return b.filter(function (c) {
				return c !== head;
			});
		});
		a = a.filter(function (b) {
			return b.length;
		});
		
	}
	return lin;
}

// Top type
function Top() {
	
}
Top.prototype.initialize = function () {};
Top.__mro__ = [Top];
Top.subclasses = [];


coop.Class = function(bases_or_klass, klass) {
	var bases = klass ? makeArray(bases_or_klass) : [];
	klass = klass || bases_or_klass;
	
	if(bases.length == 0) bases.push(Top);
	
	function Class() {
		if(this.initialize)
			this.initialize.apply(this, arguments);
	}
	
	Class.prototype = {};
	Class.__dict__ = {};
	Class.prototype.constructor = Class;
	Class.subclasses = [];
	
	var base_mros = bases.map(function(b) { return b.__mro__; });
	if(bases.length) base_mros.push(bases);
	
	Class.__mro__ = [Class].concat(merge(base_mros));
	Class.prototype.super = function () {
		var caller = Class.prototype.super.caller;
		var klass = caller.__class__;
		if(!klass)
			throw new Error("super must be called from within method");
		
		var mro = this.constructor.__mro__;
		for(var i = mro.indexOf(klass); i < mro.length; i++) {
			var c = mro[i];
			if(caller.name in c.prototype) {
				return c.prototype[caller.name].apply(this, arguments);
			}
		}
		throw new Error("Method " + caller.name + " has no parent");
	}
	
	Class.isinstance = function (obj) {
		return obj.constructor.__mro__.indexOf(this) >= 0;
	}
	
	// Holds class property sources
	Class.__props__ = {};
	
	Class.implement = function(props, klass) {
		// Save class in functions for super() support
		if(!klass) for(var n in props) {
			var p = props[n];
			if(typeof p == 'function')
				p.__class__ = Class;
		};
		
		klass = klass || Class;
		for(var n in props) {
			var p = props[n];
			var pc = Class.__props__[n];
			if(!pc || Class.__mro__.indexOf(klass) <= Class.__mro__.indexOf(pc)) {	
				Class.prototype[n] = p;
				Class.__props__[n] = klass;
			}
		}
		Class.subclasses.forEach(function(s) {
			s.implement(props, klass);
		});
	}
	
	Class.implement(klass);
	
	bases.forEach(function(b) {
		b.subclasses.push(Class);
		for(var n in b.__props__) {
			Class.implement({n: b.prototype[n]}, b.__props__[n]);
		}
	});
	
	return Class;
};

coop.Top = Top;

coop.Options = new coop.Class({
	initialize: function(options) {
		this.options = {};
		for(var i = this.constructor.__mro__.length - 1; i >= 0; i--) {
			var opts = this.constructor.__mro__[i].prototype.options;
			if(opts) for(var n in opts) {
				this.options[n] = opts[n];
			}
		}
		if(options) for(var n in options) {
			this.options[n] = options[n];
		}
		this.super.apply(this, Array.prototype.slice.call(arguments, 1));
	}
});
