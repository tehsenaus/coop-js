if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function () {
	var coop = {};

	var Type = exports.Type = function Type () {
		
	};


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
	Top.prototype.initialize = function () {
		
	};
	Top.__mro__ = [Top];
	Top.subclasses = [];
	Top.__dict__ = Top.prototype;


	// Returns the prototype
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
		var _super = Class.prototype.super = function () {
			var caller = _super.caller;
			var klass = caller.__class__;
			if(!klass)
				throw new Error("super must be called from within method");
			
			return klass.super(this, caller.__name__).apply(this, arguments);
		}
		var super_co = Class.prototype.super_co = function(args, n) {
			// Caller hack
			var caller = super_co.caller;
			super_co.__class__ = caller.__class__;
			super_co.__name__ = caller.__name__;
			return this.super.apply(this, Array.prototype.slice.call(args, n));
		}

		// Searches the MRO of the passed instance for the specified
		// property, starting from the superclass of this class.
		Class.super = function (instance, propertyName) {
			var klass = Class;
			var mro = instance.constructor.__mro__;
			for(var i = mro.indexOf(klass) + 1; i < mro.length; i++) {
				var c = mro[i];
				if(propertyName in c.prototype) {
					return c.prototype[propertyName];
				}
			}
			throw new Error("Property " + propertyName + " has no definition in superclasses. MRO: " + mro);
		}

		Class.issuperclass = function (cls) {
			var mro = cls.__mro__;
			return mro && mro.indexOf(this) >= 0;
		}
		Class.isinstance = function (obj) {
			return Class.issuperclass(obj.constructor);
		}
		
		// Holds class property sources
		Class.__props__ = {};
		
		Class.implement = function(props, klass) {
			// Save class in functions for super() support
			if(!klass) for(var n in props) {
				var p = props[n];
				if(typeof p == 'function') {
					p.__class__ = Class;
					p.__name__ = n;
				}
			};
			
			klass = klass || Class;
			for(var n in props) {
				var p = props[n];
				var pc = Class.__props__.hasOwnProperty(n) && Class.__props__[n];
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
				var ps = {}
				ps[n] = b.prototype[n];
				Class.implement(ps, b.__props__[n]);
			}
		});
		
		Class.derived = function (properties) {
			return new coop.Class(Class, properties);
		};

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



	coop.pop = function (args, n) {
		return Array.prototype.slice.call(args, n === undefined ? 1 : n);
	}
	coop.push = function (args) {
		return Array.prototype.concat.call(coop.pop(arguments), args);
	}

	return coop;
});
