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
      {
        message:
          'You can not provide both an env and a value in the config object. Config name: host',
        path: 'db.host',
      },
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

    expect(validateSchema(schema)).toEqual([
      { message: 'localhost is not of type Number', path: 'db.host' },
    ]);
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

    expect(validateSchema(schema)).toEqual([
      { message: 'must include somethingelse', path: 'db.host' },
    ]);
  });
});

describe('validateCentigBlock', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should throw Error if type validation fails', () => {
    expect(() =>
      validateCentigBlock({ type: Number, value: '3000' }),
    ).toThrowError('3000 is not of type Number');
  });

  it('should throw Error if custom validate function throws', () => {
    expect(() =>
      validateCentigBlock({
        type: String,
        value: '3000',
        validate: () => {
          throw Error('custom error message');
        },
      }),
    ).toThrowError('custom error message');
  });

  it('should call preprocess if it is present', () => {
    const mockPreprocess = jest.fn(value => value);
    validateCentigBlock({
      type: Number,
      value: 3000,
      preprocess: mockPreprocess,
    });

    expect(mockPreprocess).toHaveBeenCalled();
  });

  it('should call validate if it is present', () => {
    const mockValidate = jest.fn();
    validateCentigBlock({
      type: Number,
      value: 3000,
      validate: mockValidate,
    });

    expect(mockValidate).toHaveBeenCalled();
  });

  it('should throw Error if env value is present but env value not exist', () => {
    expect(() =>
      validateCentigBlock({
        type: Number,
        env: 'DB_PORT',
      }),
    ).toThrowError('Missing environment variable "DB_PORT".');
  });

  it('should throw Error preprocess is present but not a function', () => {
    expect(() =>
      validateCentigBlock({
        type: Number,
        value: 5000,
        preprocess: 123 as any,
      }),
    ).toThrowError('The value of preprocess most be of type function.');
  });

  it('should throw Error validate is present but not a function', () => {
    expect(() =>
      validateCentigBlock({
        type: Number,
        value: 5000,
        validate: 123 as any,
      }),
    ).toThrowError('The value of validate value most be of type function.');
  });

  it('should call typeCheck only if a type is present', () => {
    const mockValidateTypeFn = jest.fn();
    validateCentigBlock(
      {
        type: Number,
        value: 3000,
      },
      mockValidateTypeFn,
    );
    validateCentigBlock(
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
      {
        type: String,
        value: 3000,
        preprocess: mockPreprocess,
      },
      mockValidateTypeFn,
    );
    expect(mockValidateTypeFn).toHaveBeenCalledWith('new value', String);
  });

  it('should call validate with the preprocessed value', () => {
    const mockPreprocess = jest.fn(() => 'new value');
    const mockValidateTypeFn = jest.fn();
    const mockValidate = jest.fn();

    validateCentigBlock(
      {
        type: String,
        value: 3000,
        preprocess: mockPreprocess,
        validate: mockValidate,
      },
      mockValidateTypeFn,
    );
    expect(mockValidate).toHaveBeenCalledWith('new value');
  });

  it('should call validate with the defaultValue', () => {
    const mockValidateTypeFn = jest.fn();
    const mockValidate = jest.fn();
    const defaultValue = 'default-value'
    validateCentigBlock(
      {
        type: String,
        env: 'NOT_EXISTING',
        validate: mockValidate,
        defaultValue,
      },
      mockValidateTypeFn,
    );
    expect(mockValidate).toHaveBeenCalledWith(defaultValue);
  });

  it('should call preprocess with the defaultValue', () => {
    const mockPreprocess = jest.fn(() => 'new value');
    const mockValidateTypeFn = jest.fn();
    const mockValidate = jest.fn();
    const defaultValue = 'default-value'
    validateCentigBlock(
      {
        type: String,
        env: 'NOT_EXISTING',
        preprocess: mockPreprocess,
        validate: mockValidate,
        defaultValue,
      },
      mockValidateTypeFn,
    );
    expect(mockPreprocess).toHaveBeenCalledWith(defaultValue);
  });

  it('should not call preprocess or validation if optional flag is set and value not present', () => {
    const mockValidate = jest.fn();
    const mockPreprocess = jest.fn();
    validateCentigBlock({
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
    expect(() => typeCheckValue('mock-value', 'string' as any)).toThrowError(
      'string is not a valid type',
    );
  });

  it('should throw Error if passed type is not supported', () => {
    expect(() => typeCheckValue('mock-value', Date as any)).toThrowError(
      'Date is not a supported typ',
    );
  });
});
