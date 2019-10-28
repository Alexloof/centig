import {
  IConfigBlock,
  ISupportedTypes,
  supportedTypes,
  IUserConfigs,
} from './centig';

import {
  isObject,
  isFunction,
  isConstructor,
  isConstructorType,
  isConfigBlock,
  hasDuplicateConfigValues,
} from './utils';

const validateConfigs = (configs: IUserConfigs) => {
  let errors: string[] = [];

  Object.keys(configs).forEach(configName => {
    const configBlock = configs[configName];

    try {
      if (isObject(configBlock)) {
        if (isConfigBlock(configBlock)) {
          if (hasDuplicateConfigValues(configBlock)) {
            throw Error(
              'You can not provide both an env and a value in the config object. Config name: ' +
                configName,
            );
          }
          validateConfigBlock(configName, configBlock);
        }

        // if the config object is not a centig specific block - continue with nested validation
        errors = [...errors, ...validateConfigs(configBlock)];
      }

      // If there is no config block, then there is no need for validation
      return;
    } catch (error) {
      errors = [...errors, error.message];
    }
  });
  return errors;
};

const validateConfigBlock = (name: string, configBlock: IConfigBlock) => {
  const { optional, preprocess, validate, type, env, value } = configBlock;

  const valueToValidate = configBlock.hasOwnProperty('env')
    ? process.env[env]
    : value;

  if (!valueToValidate) {
    if (optional) {
      // if no value is present and at the same time is optional we stop validation process
      return;
    }
    throw Error('Missing environment variable. Config name: ' + name);
  }

  let processedValue = null;

  if (preprocess) {
    if (!isFunction(preprocess)) {
      throw Error('The process value most by a function. Config name: ' + name);
    }
    processedValue = preprocess(valueToValidate);
  }

  if (validate) {
    if (!isFunction(validate)) {
      throw Error(
        'The validate value most by a function. Config name: ' + name,
      );
    }
    validate(valueToValidate);
  }

  if (type) {
    typeCheckValue(processedValue || valueToValidate, type, name);
  }
};

const typeCheckValue = (
  value: any,
  type: ISupportedTypes,
  configName: string,
) => {
  if (!isConstructor(type)) {
    throw Error(type + ' is not a valid type');
  }

  const formattedTypeName = new type().constructor.name;

  if (!supportedTypes.includes(formattedTypeName)) {
    throw Error(new type().constructor.name + ' is not a supported type');
  }

  if (!isConstructorType(value, type)) {
    throw Error(configName + ' is not of type ' + formattedTypeName);
  }
};

export default validateConfigs;
