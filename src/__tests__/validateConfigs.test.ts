import validateConfigs, {
  validateConfigBlock,
  typeCheckValue,
} from '../validateConfigs';

describe('validateConfigs', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should not return any errors if empty object', () => {
    expect(validateConfigs({})).toEqual([]);
  });

  it('should throw Error if schema has a centig specific config block with both env and value props', () => {
    const schema = {
      db: {
        host: {
          type: Number,
          env: 'DB_HOST',
          value: 'localhost',
        },
      },
    };

    expect(validateConfigs(schema)).toEqual([
      'You can not provide both an env and a value in the config object. Config name: host',
    ]);
  });

  it('should return Error message if schema does not validate the "type" property', () => {
    const schema = {
      db: {
        host: {
          type: Number,
          value: 'localhost',
        },
      },
    };

    expect(validateConfigs(schema)).toEqual(['host is not of type Number']);
  });

  it('should return Error message if schema does not validate the validate function which throw Error', () => {
    const schema = {
      db: {
        host: {
          type: String,
          value: 'localhost',
          validate: (value: any) => {
            if (!value.includes('somethingelse')) {
              throw Error('must include somethingelse');
            }
          },
        },
      },
    };

    expect(validateConfigs(schema)).toEqual(['must include somethingelse']);
  });
});

describe('validateConfigBlock', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should throw Error if type validation fails', () => {
    expect(() =>
      validateConfigBlock('port', { type: Number, value: '3000' }),
    ).toThrowError('port is not of type Number');
  });

  it('should throw Error if custom validate function throws', () => {
    expect(() =>
      validateConfigBlock('port', {
        type: String,
        value: '3000',
        validate: () => {
          throw Error('custom error message');
        },
      }),
    ).toThrowError('custom error message');
  });

  it('should call preprocess if it is present', () => {
    const mockPreprocess = jest.fn();
    validateConfigBlock('port', {
      type: Number,
      value: 3000,
      preprocess: mockPreprocess,
    });

    expect(mockPreprocess).toHaveBeenCalled();
  });

  it('should call validate if it is present', () => {
    const mockValidate = jest.fn();
    validateConfigBlock('port', {
      type: Number,
      value: 3000,
      validate: mockValidate,
    });

    expect(mockValidate).toHaveBeenCalled();
  });

  it('should call typeCheck only if a type is present', () => {
    const mockValidateTypeFn = jest.fn();
    validateConfigBlock(
      'port',
      {
        type: Number,
        value: 3000,
      },
      mockValidateTypeFn,
    );
    validateConfigBlock(
      'port',
      {
        value: 3000,
      },
      mockValidateTypeFn,
    );

    expect(mockValidateTypeFn).toHaveBeenCalledTimes(1);
  });

  it('should call typeCheck with the preprocessed value if preprocess is present', () => {
    const mockPreprocess = jest.fn(() => 'new value');
    const mockValidateTypeFn = jest.fn();

    validateConfigBlock(
      'port',
      {
        type: String,
        value: 3000,
        preprocess: mockPreprocess,
      },
      mockValidateTypeFn,
    );
    expect(mockValidateTypeFn).toHaveBeenCalledWith(
      'new value',
      String,
      'port',
    );
  });

  it('should not call preprocess or validation if optional flag is set and value not present', () => {
    const mockValidate = jest.fn();
    const mockPreprocess = jest.fn();
    validateConfigBlock('port', {
      type: Number,
      env: '',
      validate: mockValidate,
      preprocess: mockPreprocess,
      optional: true,
    });

    expect(mockValidate).not.toHaveBeenCalled();
    expect(mockPreprocess).not.toHaveBeenCalled();
  });
});
