require('dotenv').config();

import centig from './centig';

console.log(process.env);

const config = centig({
  ip: 'ip-test',
  db: {
    host: 'test',
    name: {
      first: 'hej',
    },
  },
  port: {
    type: Number,
    env: 'PORT',
  },
  test: {
    type: Number,
    env: 'TEST',
  },
});

console.log(config.get('ip'));
console.log(config.get('db.host'));
console.log(config.get('db').host);
console.log(config.get('db.name.first'));

console.log(config.get('port'));
