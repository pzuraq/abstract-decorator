/* global QUnit, test */
const abstract = require('../lib').default;

@abstract
class AbstractClass {
  @abstract field;

  @abstract method() {}
}

QUnit.module('@abstract', () => {
  QUnit.module('allowed', () => {
    test('does not throw if abstract fields and methods are implemented', assert => {
      class ImplClass extends AbstractClass {
        field = 123;
        method() {
          return 123;
        }
      }

      let instance = new ImplClass();

      assert.equal(instance.field, 123);
      assert.equal(instance.method(), 123);
    });

    test('allows methods on instance', assert => {
      class ImplClass extends AbstractClass {
        field = 123;
        method = () => 123;
      }

      let instance = new ImplClass();

      assert.equal(instance.field, 123);
      assert.equal(instance.method(), 123);
    });
  });

  QUnit.module('errors', () => {
    test('throws if abstract fields are not implemented', assert => {
      class ImplClass extends AbstractClass {
        method() {
          return 123;
        }
      }

      assert.throws(() => {
        new ImplClass();
      }, /The AbstractClass#field property was marked as an abstract class property/);
    });

    test('throws if abstract methods are not implemented', assert => {
      class ImplClass extends AbstractClass {
        field = 123;
      }

      assert.throws(() => {
        new ImplClass();
      }, /The AbstractClass#method method was marked as an abstract class method/);
    });

    test('throws if methods are not methods', assert => {
      class ImplClass extends AbstractClass {
        field = 123;
        method = 123;
      }

      assert.throws(() => {
        new ImplClass();
      }, /The AbstractClass#method method was marked as an abstract class method, but it was not implemented as a method./);
    });

    test('throws if class decorator used without any fields', assert => {
      assert.throws(() => {
        @abstract
        class Foo {}

        new Foo();
      }, /The Foo class was marked as @abstract, but doesn't have an @abstract API methods or properties./);
    });
  });
});
