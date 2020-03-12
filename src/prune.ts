import { isObject, isCentigBlock } from './utils';
import { ISchema, ICentigBlock } from './centig';

const prune = <T>(schema: ISchema): T => {
  return Object.keys(schema).reduce(
    (accumulator: { [index: string]: any }, configName: string) => {
      const configBlock = schema[configName];
      if (isObject(configBlock)) {
        if (isCentigBlock(configBlock)) {
          const centigConfigBlock = configBlock as ICentigBlock;
          let value = centigConfigBlock.hasOwnProperty('env')
            ? process.env[centigConfigBlock.env as string]
            : centigConfigBlock.value;

          if (!value && centigConfigBlock.hasOwnProperty('defaultValue')) {
            value = centigConfigBlock.defaultValue
          }

          accumulator[configName] = centigConfigBlock.preprocess
            ? centigConfigBlock.preprocess(value)
            : value;

          return accumulator;
        }

        // if the config object is not a centig specific block - continue prune nested configs
        accumulator[configName] = prune(configBlock as ISchema);
        return accumulator;
      }

      // if block is not an object we don't need to prune any stuff
      accumulator[configName] = configBlock;
      return accumulator;
    },
    {},
  ) as T;
};

export default prune;
