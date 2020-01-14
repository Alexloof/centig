import centig from '../centig';
import validateSchema from '../validateSchema';
import mockSchema from '../__fixtures__/mockSchema';

jest.mock('../validateSchema');

const mockValidate = (validateSchema as unknown) as jest.Mock<
  typeof validateSchema
>;

const mockExpected = {
  db: {
    host: 'localhost',
    port: 5050,
    name: 'admin',
  },
  api: {
    url: 'https://api.url.com',
    key: 12345,
  },
  newFeature: {
    isSupported: true,
    regex: /\babc\b/,
  },
  logLevel: 'info',
};

function setEnvironmentMockVars() {
  process.env.API_URL = 'https://api.url.com';
  process.env.API_KEY = '12345';
  process.env.NEW_FEATURE_SUPPORT = '1';
  process.env.LOG_LEVEL = 'info';
}

describe('centig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    mockValidate.mockReturnValue([] as any);
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should return a get and an all function', () => {
    const config = centig({});
    expect(config).toHaveProperty('get');
    expect(config).toHaveProperty('all');
  });

  it('should throw Error if validation fails', () => {
    mockValidate.mockReturnValueOnce(['error message'] as any);
    expect(() => centig({})).toThrowError();
  });

  it('should call validateConfigs function for validaton', () => {
    const schema = {
      custom: {
        name: 'test-validate',
      },
    };
    centig(schema);
    expect(mockValidate).toHaveBeenCalledWith(schema);
  });

  describe('.all()', () => {
    it('should return all configs when defining schema with shortcut values using .all()', () => {
      const schema = {
        db: {
          host: 'localhost',
          port: 5050,
          name: {
            first: 'admin',
          },
        },
      };
      const config = centig(schema);
      expect(config.all()).toEqual({
        db: {
          host: 'localhost',
          port: 5050,
          name: {
            first: 'admin',
          },
        },
      });
    });

    it('should return all configs when defining schema with all variants of configuration using .all()', () => {
      setEnvironmentMockVars();
      const config = centig(mockSchema);
      expect(config.all()).toEqual(mockExpected);
    });
  });

  describe('.get()', () => {
    it('should return the value by key when defining schema with shortcut values using .get()', () => {
      const schema = {
        db: {
          host: 'localhost',
          port: 5050,
          name: {
            first: 'admin',
          },
        },
      };
      const config = centig(schema);
      expect(config.get('db')).toEqual({
        host: 'localhost',
        port: 5050,
        name: {
          first: 'admin',
        },
      });
      expect(config.get('db.host')).toEqual('localhost');
      expect(config.get('db').port).toEqual(5050);
    });

    it('should return the value by key when defining schema with all variants of configuration using .get()', () => {
      setEnvironmentMockVars();
      const config = centig(mockSchema);
      expect(config.get('db')).toEqual(mockExpected.db);
      expect(config.get('api.key')).toEqual(mockExpected.api.key);
      expect(config.get('newFeature').isSupported).toEqual(
        mockExpected.newFeature.isSupported,
      );
      expect(config.get('logLevel')).toEqual(mockExpected.logLevel);
    });

    it('should throw if value is undefined with .get()', () => {
      setEnvironmentMockVars();
      const config = centig(mockSchema);
      expect(() => config.get('somethingNotExisting')).toThrowError();
    });
  });
});
