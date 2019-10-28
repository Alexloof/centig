import centig from './centig';

process.env.PORT = '5000';
process.env.TEST = 'TEST';
process.env.Boolmannen = '1';

const config = centig({
  ip: 'ip-test',
  db: {
    host: 'test',
    name: {
      first: 'hej',
    },
    lastname: {
      type: Number,
      env: 'PORT',
      preprocess: (value: any) => Number(value),
    },
    secret: 1122,
    secretFunction: () => console.log('secretFunction'),
  },

  test: {
    type: String,
    env: 'TEST',
    validate: (value: any) => {
      if (!value.includes('TEST')) {
        throw Error('Value must include TEST');
      }
    },
  },
  testBoolean: {
    type: Boolean,
    env: 'Boolmannen',
    preprocess: (value: any) => Boolean(Number(value)),
  },
  valueTest: {
    type: Number,
    value: 2323,
  },

  arrayTest: {
    type: Array,
    value: [2323],
  },

  objectTest: {
    type: Object,
    value: { hej: 2323 },
  },
});

console.log(config.get('ip'));
console.log(config.get('db.host'));
console.log(config.get('db').host);
console.log(config.get('db.name.first'));
console.log(config.get('db.lastname'));
console.log(typeof config.get('db').secret);
console.log(config.get('db').secretFunction);
console.log(typeof config.get('test'));
console.log(typeof config.get('testBoolean'));
console.log(config.get('valueTest'));

// console.log(config.get('port'));
