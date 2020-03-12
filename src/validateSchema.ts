import { ICentigBlock, ISupportedTypes, ISchema } from './centig';

import {
  isObject,
  isFunction,
  isConstructor,
  isConstructorType,
  isCentigBlock,
  hasDuplicateCentigBlockValues,
} from './utils';

const supportedTypes = [
  'Number',
  'String',
  'Boolean',
  'Object',
  'Array',
  'RegExp',
];

export interface IError {
  path: string;
  message: string;
}

const validateSchema = (configs: ISchema) => {
  let errors: IError[] = [];

  Object.keys(configs).forEach(configName => {
    const configBlock = configs[configName];

    try {
      if (isObject(configBlock)) {
        if (isCentigBlock(configBlock)) {
          if (hasDuplicateCentigBlockValues(configBlock as ICentigBlock)) {
            throw Error(
              'You can not provide both an env and a value in the config object. Config name: ' +
                configName,
            );
          }
          validateCentigBlock(configBlock as ICentigBlock);
        }

        // if the config object is not a centig specific block - continue with nested validation
        errors = [
          ...errors,
          ...populateWithParentPath(
            validateSchema(configBlock as ISchema),
            configName,
          ),
        ];
      }

      // If there is no config block, then there is no need for validation
      return;
    } catch (error) {
      errors = [...errors, { path: configName, message: error.message }];
    }
  });
  return errors;
};

const populateWithParentPath = (errors: IError[], configName: string) => {
  return errors.map(({ path, message }) => ({
    message,
    path: configName + '.' + path,
  }));
};

const validateCentigBlock = (
  centigBlock: ICentigBlock,
  validateTypeFn: (value: any, type: ISupportedTypes) => void = typeCheckValue,
) => {
  const {
    optional,
    preprocess,
    validate,
    type,
    env,
    value,
    defaultValue,
  } = centigBlock;

  const isAnEnvVarConfigBlock = !!centigBlock.hasOwnProperty('env');

  let valueToValidate = isAnEnvVarConfigBlock
    ? process.env[env as string]
    : value;

  if (!valueToValidate) {
    if (centigBlock.hasOwnProperty('defaultValue')) {
      valueToValidate = defaultValue;
    } else {
      if (optional) {
        // if no value is present and at the same time is optional we stop validation process
        return;
      }
      throw Error(
        `Missing ${isAnEnvVarConfigBlock ? 'environment' : 'value'} variable ${
          isAnEnvVarConfigBlock ? '"' + env + '"' : value
        }.`,
      );
    }
  }

  if (preprocess) {
    if (!isFunction(preprocess)) {
      throw Error('The value of preprocess most be of type function.');
    }
    valueToValidate = preprocess(valueToValidate);
  }

  if (validate) {
    if (!isFunction(validate)) {
      throw Error('The value of validate value most be of type function.');
    }
    validate(valueToValidate);
  }

  if (type) {
    validateTypeFn(valueToValidate, type);
  }
};

const typeCheckValue = (value: any, type: ISupportedTypes) => {
  if (!isConstructor(type)) {
    throw Error(type + ' is not a valid type');
  }

  const formattedTypeName = new type().constructor.name;

  if (!supportedTypes.includes(formattedTypeName)) {
    throw Error(formattedTypeName + ' is not a supported type');
  }

  if (!isConstructorType(value, type)) {
    throw Error(
      (value || 'The value') + ' is not of type ' + formattedTypeName,
    );
  }
};

export { validateSchema as default, typeCheckValue, validateCentigBlock };
