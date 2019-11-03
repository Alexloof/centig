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
          if (hasDuplicateConfigValues(configBlock as IConfigBlock)) {
            throw Error(
              'You can not provide both an env and a value in the config object. Config name: ' +
                configName,
            );
          }
          validateConfigBlock(configName, configBlock as IConfigBlock);
        }

        // if the config object is not a centig specific block - continue with nested validation
        errors = [...errors, ...validateConfigs(configBlock as IUserConfigs)];
      }

      // If there is no config block, then there is no need for validation
      return;
    } catch (error) {
      errors = [...errors, error.message];
    }
  });
  return errors;
};

const validateConfigBlock = (
  name: string,
  configBlock: IConfigBlock,
  validateTypeFn: (
    value: any,
    type: ISupportedTypes,
    configName: string,
  ) => void = typeCheckValue,
) => {
  const { optional, preprocess, validate, type, env, value } = configBlock;

  const isAnEnvVarConfigBlock = !!configBlock.hasOwnProperty('env');

  const valueToValidate = isAnEnvVarConfigBlock
    ? process.env[env as string]
    : value;

  if (!valueToValidate) {
    if (optional) {
      // if no value is present and at the same time is optional we stop validation process
      return;
    }
    throw Error(
      `Missing ${
        isAnEnvVarConfigBlock ? 'environment' : 'value'
      } variable. Config name: ${name}`,
    );
  }

  let processedValue = null;

  if (preprocess) {
    if (!isFunction(preprocess)) {
      throw Error(
        'The preprocess value most by a function. Config name: ' + name,
      );
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
    validateTypeFn(processedValue || valueToValidate, type, name);
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

export { validateConfigs as default, typeCheckValue, validateConfigBlock };
