import centig from './centig';

process.env.PORT = '5000';
process.env.TEST = 'TEST';
// console.log(process.env.PORT);
// console.log(process.env.TEST);

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
    secretFunction: function() {
      console.log('secretFunction');
    },
  },
  // port: {
  //   type: Number,
  //   env: 'PORT',
  // },
  test: {
    type: String,
    env: 'TEST',
    validate: (value: any) => {
      if (!value.includes('TEST')) {
        throw Error('Value must include TEST');
      }
    },
  },
  // test2: {
  //   type: String,
  //   env: 'TEST',
  // },
});

// console.log(config.get('ip'));
// console.log(config.get('db.host'));
// console.log(config.get('db').host);
// console.log(config.get('db.name.first'));
// console.log(config.get('db.lastname'));
// console.log(config.get('db').secret);
// console.log(config.get('db.secretFunction'));
// console.log(config.get('test'));

// console.log(config.get('port'));
