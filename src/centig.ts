import validateConfigs from './validateConfigs';
import prune from './prune';

export interface IConfigBlock {
  type?: ISupportedTypes;
  env?: string;
  value?: any;
  validate?: (value: string) => void;
  preprocess?: (value: any) => any;
  optional?: boolean;
}

export type ISupportedTypes =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor;

export type IValueTypes =
  | boolean
  | number
  | string
  | any[]
  | { [index: string]: any }
  | (() => void);

export interface IUserConfigs {
  [index: string]: IConfigBlock | IValueTypes | IUserConfigs;
}

export const supportedTypes = [
  'Number',
  'String',
  'Boolean',
  'Object',
  'Array',
];

const centig = <T>(userConfigs: IUserConfigs) => {
  const errors = validateConfigs(userConfigs);

  if (errors.length) {
    throwErrorBeautifully(errors);
  }
  const prunedConfig = prune<T>(userConfigs);

  return {
    get<P extends keyof T | string>(path: P): P extends keyof T ? T[P] : any {
      let config = prunedConfig[path as keyof T];

      if (!config) {
        const splittedPath = (path as string).split('.');
        let standardConfig = prunedConfig as any;

        splittedPath.forEach(singlePath => {
          standardConfig = standardConfig[singlePath];
        });

        config = standardConfig;
      }
      return config as P extends keyof T ? T[P] : any;
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
