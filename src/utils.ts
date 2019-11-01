import { IValueTypes, ISupportedTypes, IConfigBlock } from './centig';

function isConstructor(f: any) {
  try {
    // tslint:disable-next-line: no-unused-expression
    new f();
  } catch (err) {
    return false;
  }
  return true;
}

const isConstructorType = (value: IValueTypes, type: ISupportedTypes) => {
  return (
    Object.prototype.toString.call(new type()) ===
    Object.prototype.toString.call(value)
  );
};

const isObject = (input: any) => typeof input === 'object';

const isFunction = (input: any) => typeof input === 'function';

const isConfigBlock = (configBlock: any): boolean => {
  return (
    typeof configBlock === 'object' &&
    (configBlock.hasOwnProperty('env') || configBlock.hasOwnProperty('value'))
  );
};

const hasDuplicateConfigValues = (configBlock: IConfigBlock): boolean => {
  return (
    configBlock.hasOwnProperty('env') && configBlock.hasOwnProperty('value')
  );
};

export {
  isConstructor,
  isConstructorType,
  isObject,
  isFunction,
  isConfigBlock,
  hasDuplicateConfigValues,
};
