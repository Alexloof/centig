function isConstructor(f: any) {
  try {
    // tslint:disable-next-line: no-unused-expression
    new f();
  } catch (err) {
    return false;
  }
  return true;
}

const isConstructorType = (value: any, type: any) => {
  return (
    Object.prototype.toString.call(new type()) ===
    Object.prototype.toString.call(value)
  );
};

const isConfigBlock = (configBlock: any): boolean => {
  return (
    typeof configBlock === 'object' &&
    (configBlock.hasOwnProperty('env') || configBlock.hasOwnProperty('value'))
  );
};

const hasDuplicateConfigValues = (configBlock: any): boolean => {
  return (
    configBlock.hasOwnProperty('env') && configBlock.hasOwnProperty('value')
  );
};

const isObject = (input: any) => {
  if (typeof input === 'object') {
    return true;
  }
  return false;
};

const isFunction = (input: any) => {
  if (typeof input === 'function') {
    return true;
  }
  return false;
};

// const isNumber = (input: any) => {
//   const value = Number(input);
//   if (isNaN(value)) {
//     return false;
//   }
//   return true;
// };

// const isString = (input: any) => {
//   if (typeof input === 'string' || input instanceof String) {
//     return true
//   }
//   return false
// };

const supportedTypes = ['Number', 'String', 'Boolean', 'Object', 'Array'];

type IType = StringConstructor | NumberConstructor | BooleanConstructor;

const typeCheck = (value: any, type: IType, configName: string) => {
  if (!isConstructor(type)) {
    throw Error(type + ' is not a valid type');
  }

  const formattedTypeName = new type().constructor.name;

  if (!supportedTypes.includes(formattedTypeName)) {
    throw Error(type + ' is not a supported type');
  }

  if (!isConstructorType(value, type)) {
    throw Error(configName + ' is not of type ' + formattedTypeName);
  }
};

interface IConfig {
  [index: string]: any;
}

const validate = (configs: IConfig) => {
  let errors: string[] = [];

  Object.keys(configs).forEach(configName => {
    const configBlock = configs[configName];
    try {
      if (isObject(configBlock)) {
        if (isConfigBlock(configBlock)) {
          if (hasDuplicateConfigValues(configBlock)) {
            throw Error(
              'You can not provide both a an env and a value. Config name: ' +
                configName,
            );
          }
          if (configBlock.hasOwnProperty('env')) {
            const envValue = process.env[configBlock.env];
            if (!envValue && !configBlock.optional) {
              throw Error(
                'Missing environment variable. Config name: ' + configName,
              );
            }

            let processedValue = null;

            if (configBlock.process) {
              if (!isFunction(configBlock.process)) {
                throw Error(
                  'The process value most by a function. Config name: ' +
                    configName,
                );
              }
              processedValue = configBlock.process(envValue);
            }

            if (configBlock.validate) {
              if (!isFunction(configBlock.validate)) {
                throw Error(
                  'The validate value most by a function. Config name: ' +
                    configName,
                );
              }
              if (!configBlock.validate(envValue)) {
                throw Error(
                  configName + ' did not fulfill you custom validate function',
                );
              }
            }

            if (configBlock.type) {
              return typeCheck(
                processedValue || envValue,
                configBlock.type,
                configName,
              );
            }
            return envValue;
          }
        }

        // the config object is not a centig specific block - continue with nested validation
        errors = [...errors, ...validate(configBlock)];
      }

      // If there is no config block, then there is no need for validation
      return;
    } catch (error) {
      errors = [...errors, error.message];
    }
  });
  // console.log({ errors });
  return errors;
};

const centig = (jsonConfig: IConfig) => {
  const errors = validate(jsonConfig);
  console.log({ errors });

  if (errors.length) {
    const output = errors
      .map((errorMessage: string) => errorMessage)
      .join('\n');

    throw Error(output);
  }

  return {
    get(path: string) {
      let config = jsonConfig[path];

      if (!config) {
        const test = path.split('.');
        let standardConfig = jsonConfig;

        test.forEach(singlePath => {
          standardConfig = standardConfig[singlePath];
        });

        config = standardConfig;
      }

      if (!config) return null;

      if (typeof config === 'object') {
        if (config.env) {
          config = process.env[config.env];
        }
      }

      return config;
    },
  };
};

export default centig;
