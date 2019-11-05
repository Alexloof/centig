import validateSchema, {
  validateCentigBlock,
  typeCheckValue,
} from '../validateSchema';

describe('validateSchema', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should not return any errors if empty object', () => {
    expect(validateSchema({})).toEqual([]);
  });

  it('should return Error message if schema has a centig specific config block with both env and value props', () => {
    const schema = {
      db: {
        host: {
          type: Number,
          env: 'DB_HOST',
          value: 'localhost',
        },
      },
    };

    expect(validateSchema(schema)).toEqual([
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

    expect(validateSchema(schema)).toEqual(['host is not of type Number']);
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

    expect(validateSchema(schema)).toEqual(['must include somethingelse']);
  });
});

describe('validateCentigBlock', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should throw Error if type validation fails', () => {
    expect(() =>
      validateCentigBlock('port', { type: Number, value: '3000' }),
    ).toThrowError('port is not of type Number');
  });

  it('should throw Error if custom validate function throws', () => {
    expect(() =>
      validateCentigBlock('port', {
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
    validateCentigBlock('port', {
      type: Number,
      value: 3000,
      preprocess: mockPreprocess,
    });

    expect(mockPreprocess).toHaveBeenCalled();
  });

  it('should call validate if it is present', () => {
    const mockValidate = jest.fn();
    validateCentigBlock('port', {
      type: Number,
      value: 3000,
      validate: mockValidate,
    });

    expect(mockValidate).toHaveBeenCalled();
  });

  it('should throw Error if env value is present but is an empty string', () => {
    const mockValidate = jest.fn();

    expect(() =>
      validateCentigBlock('port', {
        type: Number,
        env: '',
      }),
    ).toThrowError('Missing environment variable. Config name: port');
  });

  it('should throw Error preprocess is present but not a function', () => {
    expect(() =>
      validateCentigBlock('port', {
        type: Number,
        value: 5000,
        preprocess: 123 as any,
      }),
    ).toThrowError(
      'The preprocess value most by a function. Config name: port',
    );
  });

  it('should throw Error validate is present but not a function', () => {
    expect(() =>
      validateCentigBlock('port', {
        type: Number,
        value: 5000,
        validate: 123 as any,
      }),
    ).toThrowError('The validate value most by a function. Config name: port');
  });

  it('should call typeCheck only if a type is present', () => {
    const mockValidateTypeFn = jest.fn();
    validateCentigBlock(
      'port',
      {
        type: Number,
        value: 3000,
      },
      mockValidateTypeFn,
    );
    validateCentigBlock(
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

    validateCentigBlock(
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
    validateCentigBlock('port', {
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

describe('typeCheckValue', () => {
  it('should throw Error if passed type is a supported constructor', () => {
    expect(() =>
      typeCheckValue('mock-value', 'string' as any, 'mock-name'),
    ).toThrowError('string is not a valid type');
  });

  it('should throw Error if passed type is not supported', () => {
    expect(() =>
      typeCheckValue('mock-value', Date as any, 'mock-name'),
    ).toThrowError('Date is not a supported typ');
  });
});
