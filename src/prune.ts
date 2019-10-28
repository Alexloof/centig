import { isObject, isConfigBlock } from './utils';
import { IUserConfigs } from './centig';

const prune = (configs: IUserConfigs): IUserConfigs => {
  return Object.keys(configs).reduce((accumulator: any, configName: string) => {
    const configBlock = configs[configName];
    if (isObject(configBlock)) {
      if (isConfigBlock(configBlock)) {
        accumulator[configName] = configBlock.hasOwnProperty('env')
          ? process.env[configBlock.env]
          : configBlock.value;
        return accumulator;
      }

      // if the config object is not a centig specific block - continue prune nested configs
      accumulator[configName] = prune(configBlock);
      return accumulator;
    }

    // if block is not an object we don't need to prune any stuff
    accumulator[configName] = configBlock;
    return accumulator;
  }, {});
};

export default prune;
