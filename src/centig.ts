function isConstructor(f: any) {
  try {
    // tslint:disable-next-line: no-unused-expression
    new f();
  } catch (err) {
    return false;
  }
  return true;
}

const typeCheck = (value: any, type: any) => {
  if (isConstructor(type)) {
    console.log(new type().constructor.name);
    if (
      !(
        Object.prototype.toString.call(new type()) ===
        Object.prototype.toString.call(value)
      )
    ) {
      throw Error(value + ' is not of type ' + type);
    }

    // if (new type().constructor.name === 'Boolean') {
    //   Boolean(value)
    // }
  } else {
    if (typeof type === 'function') {
      if (!type(value)) {
        throw Error(value + 'is not accepted by you custum function: ' + type);
      }
    }
  }
};

interface IConfig {
  [index: string]: any;
}

const validate = (configs: IConfig) => {
  const errors: any = [];
  Object.keys(configs).forEach(configRow => {
    const confBlock = configs[configRow];
    try {
      // If there is no configuration block, then there is no validation
      if (typeof confBlock === 'string') return;

      if (typeof confBlock === 'object') {
        if (confBlock.hasOwnProperty('env')) {
          // validating the configuration object
          const envValue = process.env[confBlock.env];
          if (!envValue)
            throw Error('Missing environment variable ' + confBlock);
          if (confBlock.type) {
            return typeCheck(envValue, confBlock.type);
          }
          return envValue;
        }

        return validate(configs[configRow]);
      }
      console.log(confBlock);
      throw Error('Validation error');
    } catch (error) {
      errors.push({ error: error.message });
    }
  });
  return errors;
};

const centig = (jsonConfig: IConfig) => {
  const errors = validate(jsonConfig);

  if (errors.length) {
    const output = errors.map((errBlock: any) => errBlock.error).join('\n');

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
