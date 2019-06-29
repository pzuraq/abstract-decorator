import QUnit, { module, test } from 'qunit';
import abstract from 'abstract-decorator';

import { DEBUG } from '@glimmer/env';

@abstract
class AbstractClass {
  @abstract field;
  @abstract method() {}
}

module('@abstract', () => {
  if (DEBUG) {
    module('allowed', () => {
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

    module('errors', () => {
      test('does not throw if abstract fields are not implemented', assert => {
        assert.throws(() => {
          new AbstractClass();
        }, /You attempted to create an instance of AbstractClass/);
      });

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

      test('throws if field decorator used without class decorator', assert => {
        let called = assert.async(1);

        // Suppress the global error message
        let preventDefault = e => {
          e.preventDefault();
          window.removeEventListener('unhandledrejection', preventDefault);
        };

        window.addEventListener('unhandledrejection', preventDefault);

        // Suppress the QUnit error handler
        let originalHandler = QUnit.onUnhandledRejection;

        QUnit.onUnhandledRejection = e => {
          QUnit.onUnhandledRejection = originalHandler;

          assert.ok(
            e.message.match(
              /You attempted to mark some elements of Foo as @abstract/
            )
          );

          called();
        };

        // Trigger the error. Wrapping this in a function to ensure we don't do
        // it by accident before we setup the error handling.
        (function() {
          class Foo {
            @abstract foo;
          }

          new Foo();
        })();
      });
    });
  } else {
    module('production', () => {
      test('does not throw if abstract fields are not implemented', assert => {
        assert.expect(0);

        class ImplClass extends AbstractClass {
          method() {
            return 123;
          }
        }

        new ImplClass();
      });

      test('does not throw if abstract fields are not implemented', assert => {
        assert.expect(0);

        new AbstractClass();
      });

      test('does not throw if abstract methods are not implemented', assert => {
        assert.expect(0);

        class ImplClass extends AbstractClass {
          field = 123;
        }

        new ImplClass();
      });

      test('does not throw if methods are not methods', assert => {
        assert.expect(0);

        class ImplClass extends AbstractClass {
          field = 123;
          method = 123;
        }

        new ImplClass();
      });

      test('does not throw if class decorator used without any fields', assert => {
        assert.expect(0);

        @abstract
        class Foo {}

        new Foo();
      });

      test('does not throw if field decorator used without class decorator', assert => {
        assert.expect(0);
        let called = assert.async(1);

        class Foo {
          @abstract foo;
        }

        new Foo();

        Promise.resolve().then(called);
      });
    });
  }
});
