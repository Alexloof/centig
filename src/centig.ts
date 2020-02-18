import validateSchema, { IError } from './validateSchema';
import prune from './prune';

export interface ICentigBlock {
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

export interface ISchema {
  [index: string]: ICentigBlock | IValueTypes | ISchema;
}

const centig = <T>(schema: ISchema) => {
  const errors = validateSchema(schema);

  if (errors.length) {
    throwErrorBeautifully(errors);
  }
  const prunedConfig = prune<T>(schema);

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
      const value = config as P extends keyof T ? T[P] : any;

      if (value === undefined) {
        throw Error(
          `The config value you tried to get does not exist in the configuration schema \n\n   At path: ${path}`,
        );
      }

      return value;
    },

    all() {
      return prunedConfig;
    },
  };
};

const throwErrorBeautifully = (errors: IError[]) => {
  const isNodeJs = typeof window === 'undefined';
  const colorWarning = isNodeJs ? '\x1b[33;1m' : '';
  const colorReset = isNodeJs ? '\x1b[0m' : '';
  const output = errors
    .map(
      ({ message, path }: IError) =>
        `${colorWarning}✘${colorReset}  ${message} \n\n   At path: ${path}`,
    )
    .join('\n\n\n');

  throw Error('\n\n' + 'Centig Error \n\n' + output + '\n');
};

export default centig;
