import { isObject, isConfigBlock } from './utils';
import { IUserConfigs, IConfigBlock } from './centig';

const prune = <T>(configs: IUserConfigs): T => {
  return Object.keys(configs).reduce(
    (accumulator: { [index: string]: any }, configName: string) => {
      const configBlock = configs[configName];
      if (isObject(configBlock)) {
        if (isConfigBlock(configBlock)) {
          const centigConfigBlock = configBlock as IConfigBlock;
          const value = centigConfigBlock.hasOwnProperty('env')
            ? process.env[centigConfigBlock.env]
            : centigConfigBlock.value;

          accumulator[configName] = centigConfigBlock.preprocess
            ? centigConfigBlock.preprocess(value)
            : value;

          return accumulator;
        }

        // if the config object is not a centig specific block - continue prune nested configs
        accumulator[configName] = prune(configBlock as IUserConfigs);
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
