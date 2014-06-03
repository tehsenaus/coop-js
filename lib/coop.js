if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function () {
	var coop = {};

	coop.Class = Class;
	function Class() {
		return createInstance(Class, this, [].slice.call(arguments,0));
	}

	Class.prototype.__new__ = class_new,
	Class.prototype.initialize = class_initialize;
	Class.prototype.mro = function () { return [this] };
	Class.prototype.implement = class_implement;
	Class.prototype.derived = class_derived;
	Class.prototype.issuperclass = function (cls) {
		var mro = cls.__mro__;
		return mro && mro.indexOf(this) >= 0;
	};
	Class.prototype.isinstance = function (obj) {
		return this.issuperclass(obj.__class__);
	}
	Class.prototype.createSuperCaller = class_createSuperCaller;



	// Top type
	var Top = coop.Top = new Class('Top', [], {
		__new__: function () {
			return this;
		},

		initialize: function () {

		}
	})

	Class.prototype.mro = class_mro;


	// Make Class an instance of itself...
	
	morphIntoClass(Class, Class);
	Class.__class__ = Class;
	Class.initialize('Class', [Top], Class.prototype);




	function createInstance(klass, instance, args) {
		// Call new to get an instance of the class
		instance = instance.__new__.apply(instance, [klass].concat(args));

		instance.initialize.apply(instance, args);

		return instance;
	}

	function morphIntoClass(klass, instance) {
		for ( var n in klass.prototype ) {
			instance[n] = klass.prototype[n];
		}
	}

	function class_new(metaClass) {
		function klass () {
			return createInstance(klass, this, [].slice.call(arguments,0));
		}

		morphIntoClass(metaClass, klass);

		return klass;
	}

	function class_initialize(name_or_bases_or_properties, bases_or_properties, properties) {
		var name = (typeof name_or_bases_or_properties == "string") && name_or_bases_or_properties;
		var bases = name
			? (properties ? makeArray(bases_or_properties) : [])
			: (bases_or_properties ? makeArray(name_or_bases_or_properties) : []);
		properties = properties || bases_or_properties || name_or_bases_or_properties;

		if( bases.length == 0 && typeof Top !== 'undefined' ) bases.push(Top);

		this.prototype = {};
		this.prototype.__class__ = this;
		this.__bases__ = bases;
		this.__mro__ = this.mro();
		this.__subclasses__ = [];
		this.__props__ = {};
		this.__name__ = name || '<class>';

		this.implement(properties);

		bases.forEach(function(b) {
			b.__subclasses__.push(this);

			for(var n in b.__props__) {
				var ps = {}
				ps[n] = b.prototype[n];
				this.implement(ps, b.__props__[n]);
			}
		}, this);
	}

	function class_mro() {
		var base_mros = this.__bases__.map(function(b) { return b.__mro__; });
		base_mros.push(this.__bases__);
		return [this].concat(linearize(base_mros));
	};

	function class_implement(props, sourceClass) {
		sourceClass = sourceClass || this;

		for(var n in props) {
			var p = props[n];

			// If property is currently not defined, or if the source class is of higher
			// precedence in the MRO, then set the property.
			var currentSourceClass = this.__props__.hasOwnProperty(n) && this.__props__[n];
			if( !currentSourceClass || 
					this.__mro__.indexOf(sourceClass) <= this.__mro__.indexOf(currentSourceClass)
			) {
				this.prototype[n] = p;
				this.__props__[n] = sourceClass;

				if ( typeof p === 'function')
					this.prototype['super_'+n] = this.createSuperCaller(n)
			}
		}

		// Progagate to all subclasses
		this.__subclasses__.forEach(function(s) {
			s.implement(props, sourceClass);
		});
	}

	function class_derived(name_or_properties, properties) {
		return new this.__class__(properties ? name_or_properties : this,
			properties ? this : name_or_properties, properties);
	};
	
	function class_createSuperCaller(name) {
		// Searches the MRO of the passed instance for the specified
		// property, starting from the superclass of this class.
		return function (klass, args) {
			var mro = this.__class__.__mro__;
			for(var i = mro.indexOf(klass) + 1; i < mro.length; i++) {
				var c = mro[i];
				if( name in c.prototype && c.__props__[name] === c ) {
					return c.prototype[name].apply(this, args);
				}
			}
			throw new Error("Property " + name + " has no definition in superclasses. MRO: " + mro);
		}
	}




	// Legacy super() support

	var ClassWithSuper = coop.Class = Class.derived('ClassWithSuper', {
		initialize: function () {
			this.super_initialize(ClassWithSuper, arguments)

			var supercall = this.prototype.supercall = function (klass, methodName, args) {
				return this['super_' + methodName].call(this, klass, args || []);	
			}
			var _super = this.prototype['super'] = this.prototype._super = function () {
				var caller = _super.caller;
				var klass = caller.__class__;
				if(!klass)
					throw new Error("super must be called from within method.\nIn a callback, use this.supercall(Class, method[, args])");
				
				return supercall.call(this, klass, caller.__name__, arguments);
			}
			var super_co = this.prototype.super_co = function(args, n) {
				// Caller hack
				var caller = super_co.caller;
				super_co.__class__ = caller.__class__;
				super_co.__name__ = caller.__name__;
				return this['super'].apply(this, Array.prototype.slice.call(args, n));
			}
		},

		implement: function (props, sourceClass) {
			// Save class in functions for super() support
			if(!sourceClass) for(var n in props) {
				var p = props[n];
				if(typeof p == 'function') {
					p.__class__ = this;
					p.__name__ = n;
				}
			};

			return this.super_implement(ClassWithSuper, [props, sourceClass]);
		}
	});


		
		


		

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
			this._super.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	});



	coop.pop = function (args, n) {
		return Array.prototype.slice.call(args, n === undefined ? 1 : n);
	}
	coop.push = function (args) {
		return Array.prototype.concat.call(coop.pop(arguments), args);
	}

	return coop;





	function makeArray(a) {
		return a instanceof Array ? a : [a];
	}

	function linearize(a) {
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
});