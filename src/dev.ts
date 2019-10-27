import centig from './centig';

process.env.port = '5000';
process.env.test = 'TEST';
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
      process: (value: any) => Number(value),
    },
    secret: 1122,
  },
  // port: {
  //   type: Number,
  //   env: 'PORT',
  // },
  test: {
    type: String,
    env: 'TEST',
    validate: (value: any) => value.includes('hej'),
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

// console.log(config.get('port'));
