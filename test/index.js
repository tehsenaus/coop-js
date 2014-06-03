
var coop = require("../lib/coop");
var should = require("should");


describe('Class', function(){

	var A = new coop.Class("A", {
		f: function () {
			return 'a';
		}
	});
	var B = new coop.Class("B", A, {
		f: function () {
			return this.super() + 'b';
		}
	});

	var A2 = new coop.Class("A2", A, {
		f: function () {
			return this.super() + 'a2';
		}
	});

	var B2 = new coop.Class("B2", [A2, B], {
		f: function () {
			return this.super() + 'b2';
		}
	})

	it('supports diamond inheritance', function () {
		new B2().f().should.equal('aba2b2');
	})

	describe('#issuperclass()', function(){
		it('should return true for self', function(){
			B.issuperclass( B).should.equal(true);
		})

		it('should return true for direct subclass', function(){
			A.issuperclass( B ).should.equal(true);
		})

		it('should return true for diamond', function(){
			A.issuperclass( B2 ).should.equal(true);
			B.issuperclass( B2 ).should.equal(true);
			A2.issuperclass( B2 ).should.equal(true);
			B2.issuperclass( B2 ).should.equal(true);
		})

		it('should return false for diamond', function(){
			B.issuperclass( A ).should.equal(false);
			A2.issuperclass( A ).should.equal(false);
			B2.issuperclass( B ).should.equal(false);
			B2.issuperclass( A ).should.equal(false);
			B2.issuperclass( A2 ).should.equal(false);
		})
	})

	describe('#isinstance()', function(){
		it('should return true for direct instance', function(){
			B.isinstance( new B() ).should.equal(true);
		})

		it('should return true for direct subclass', function(){
			A.isinstance( new B() ).should.equal(true);
		})

		it('should return true for diamond', function(){
			A.isinstance( new B2() ).should.equal(true);
			B.isinstance( new B2() ).should.equal(true);
			A2.isinstance( new B2() ).should.equal(true);
			B2.isinstance( new B2() ).should.equal(true);
		})
	})

	describe('#implement()', function(){

		it('should override existing methods when called on the same class', function(){
			var A = new coop.Class();
			A.implement({
				f: function () {
					return 1;
				}
			});
			var B = A.derived({});
			var a = new A();
			var b = new B();

			a.f().should.equal(1);
			b.f().should.equal(1);

			A.implement({
				f: function () {
					return 2;
				}
			});

			a.f().should.equal(2);
			b.f().should.equal(2);
		})

	})
})


describe('Metaclasses', function () {

	it('allows __new__ to be overridden', function () {

		var createdInstance = 0;

		var M = coop.Class.derived({
			__new__: function (klass) {
				var instance = this.super___new__(M, arguments);

				createdInstance = instance;

				return instance;
			},

			myClass: function () {
				return this.__class__;
			}
		})



		var C = new M({
			myClass: function () {
				return this.__class__;
			}
		});

		createdInstance.should.equal(C);
		C.myClass().should.equal(M);

		var c = new C();
		c.myClass().should.equal(C);
	})

})
