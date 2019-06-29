const FIELD = Symbol('Abstract Field');
const METHOD = Symbol('Abstract Method');

const ABSTRACT_CLASS_ELEMENTS = new WeakMap();

const ABSTRACT_CLASSES = new WeakMap();
const ABSTRACT_ELEMENTS_CHECKED = new WeakMap();

export default function abstract(target, key, desc) {
  if (typeof target === 'function') {
    return makeAbstractClass(target);
  } else {
    let type = typeof desc.value === 'function' ? METHOD : FIELD;

    getAbstractElements(target.constructor).push([key, type]);

    scheduleAbstractClassCheck(
      target.constructor,
      new Error(
        `You attempted to mark some elements of ${
          target.constructor.name
        } as @abstract, but you didn't mark the class itself as @abstract. Add the @abstract decorator to the class.`
      )
    );

    return {
      writable: true,
      configurable: true,
      enumerable: false,
      value: type,
    };
  }
}

let scheduledToCheck = new Map();
let scheduledCheck = null;

function scheduleAbstractClassCheck(Klass, stack) {
  scheduledToCheck.set(Klass, stack);

  if (scheduledCheck !== null) return;

  // Schedule a check in the next tick. This is not ideal, but it's better than
  // nothing. It will only occur once per class, when they are initially
  // defined, and will not occur per subclass.
  scheduledCheck = Promise.resolve().then(() => {
    scheduledCheck = null;

    scheduledToCheck.forEach((error, Klass) => {
      if (!ABSTRACT_CLASSES.has(Klass)) {
        throw error;
      }
    });

    scheduledToCheck.clear();
  });
}

function getAbstractElements(Klass) {
  if (!ABSTRACT_CLASS_ELEMENTS.has(Klass)) {
    ABSTRACT_CLASS_ELEMENTS.set(Klass, []);
  }

  return ABSTRACT_CLASS_ELEMENTS.get(Klass);
}

function checkElements(OriginalClass, Subclass) {
  let elements = getAbstractElements(OriginalClass);

  let instance = new Subclass();

  for (let [key, type] of elements) {
    if (type === FIELD) {
      if (instance[key] === FIELD) {
        throw new Error(
          `The ${
            OriginalClass.name
          }#${key} property was marked as an abstract class property, but the ${
            Subclass.name
          } subclass didn't implement that field. You must add a class field, implement a getter/setter, or assign it a value in the constructor.`
        );
      }
    } else if (type === METHOD) {
      if (instance[key] === METHOD) {
        throw new Error(
          `The ${
            OriginalClass.name
          }#${key} method was marked as an abstract class method, but the ${
            Subclass.name
          } subclass didn't implement that method. You must add a method to its definition.`
        );
      } else if (typeof instance[key] !== 'function') {
        throw new Error(
          `The ${
            OriginalClass.name
          }#${key} method was marked as an abstract class method, but it was not implemented as a method. It was assign the value: ${
            instance[key]
          }. The method must be a function.`
        );
      }
    }
  }
}

function makeAbstractClass(Klass) {
  if (getAbstractElements(Klass).length === 0) {
    throw new Error(
      `The ${
        Klass.name
      } class was marked as @abstract, but doesn't have an @abstract API methods or properties. There's no reason for this class to be abstract.`
    );
  }

  ABSTRACT_CLASSES.set(Klass, true);

  return class AbstractClass extends Klass {
    constructor(...args) {
      super(...args);

      if (this.constructor === AbstractClass) {
        throw new Error(
          `You attempted to create an instance of ${
            Klass.name
          }, but it is an @abstract class. You must subclass it, implement its @abstract API methods, and create an instance of the subclass instead.`
        );
      }

      if (!ABSTRACT_ELEMENTS_CHECKED.has(this.constructor)) {
        ABSTRACT_ELEMENTS_CHECKED.set(this.constructor, true);

        checkElements(Klass, this.constructor);
      }
    }
  };
}
