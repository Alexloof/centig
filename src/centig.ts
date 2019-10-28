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

export type ISupportedTypes =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor;

export interface IUserConfigs {
  [index: string]: IConfigBlock | any;
}

export const supportedTypes = [
  'Number',
  'String',
  'Boolean',
  'Object',
  'Array',
];

const centig = (userConfigs: IUserConfigs) => {
  const errors = validateConfigs(userConfigs);

  if (errors.length) {
    throwErrorBeautifully(errors);
  }

  const prunedConfig = prune(userConfigs);

  return {
    get(path: string) {
      let config = prunedConfig[path];

      if (!config) {
        // try the splittet path get functionality
        const splittedPath = path.split('.');

        let standardConfig = prunedConfig;

        splittedPath.forEach(singlePath => {
          standardConfig = standardConfig[singlePath];
        });

        config = standardConfig;
      }

      return config;
    },

    toString() {
      // TODO: Implement
    },
  };
};

const throwErrorBeautifully = (errors: string[]) => {
  const output = errors.map((errorMessage: string) => errorMessage).join('\n');

  throw Error('\n' + output);
};

export default centig;
