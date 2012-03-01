
var coop = require("../lib/coop");
var should = require("should");


describe('Class', function(){
	describe('#implement()', function(){

		it('should override existing methods when called on the same class', function(){
			var A = new coop.Class();
			A.implement({
				f: function () {
					return 1;
				}
			})
			var a = new A();

			a.f().should.equal(1);

			A.implement({
				f: function () {
					return 2;
				}
			});

			a.f().should.equal(2);
		})
	})
})