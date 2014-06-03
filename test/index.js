
var coop = require("../lib/coop");
var should = require("should");


describe('Class', function(){

	it('supports diamond inheritance', function () {

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


		new B2().f().should.equal('aba2b2');
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
