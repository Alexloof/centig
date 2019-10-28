import validateConfigs from './validateConfigs';
import prune from './prune';

export interface IConfigBlock {
  type: ISupportedTypes;
  env: string;
  value: any;
  validate: (value: string) => void;
  preprocess: (value: any) => any;
  optional: boolean;
}

export const supportedTypes = [
  'Number',
  'String',
  'Boolean',
  'Object',
  'Array',
];

export type ISupportedTypes =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor;

export interface IUserConfigs {
  [index: string]: IConfigBlock | any;
}

const centig = (userConfigs: IUserConfigs) => {
  const errors = validateConfigs(userConfigs);

  if (errors.length) {
    throwErrorBeautifully(errors);
  }

  const processedConfigs = prune(userConfigs);
  console.log({ processedConfigs });

  return {
    get(path: string) {
      let config = processedConfigs[path];

      if (!config) {
        const test = path.split('.');
        let standardConfig = processedConfigs;

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

const throwErrorBeautifully = (errors: string[]) => {
  const output = errors.map((errorMessage: string) => errorMessage).join('\n');

  throw Error('\n' + output);
};

export default centig;
