export default {
  db: {
    host: 'localhost',
    port: 5050,
    name: 'admin',
  },
  api: {
    url: {
      type: String,
      env: 'API_URL',
      validate: (value: any) => new URL(value),
    },
    key: {
      type: Number,
      env: 'API_KEY',
      preprocess: (value: any) => Number(value),
    },
  },
  newFeature: {
    isSupported: {
      type: Boolean,
      env: 'NEW_FEATURE_SUPPORT',
      preprocess: (value: any) => Boolean(Number(value)),
    },
    regex: {
      type: RegExp,
      value: /\babc\b/,
    },
  },
  publicUrl: {
    type: String,
    env: 'PUBLIC_URL_NOT_EXIST',
    defaultValue: 'https://defaulturl.com',
  },
  logLevel: {
    type: String,
    env: 'LOG_LEVEL',
    validate: (value: any) => {
      const logLevels = ['debug', 'trace', 'info', 'warn', 'error', 'fatal'];
      if (!logLevels.includes(value)) {
        throw Error(
          `The value - ${value} for logLevel must be one of ${logLevels}`,
        );
      }
    },
  },
};
