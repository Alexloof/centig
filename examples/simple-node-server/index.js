const http = require('http');
const { centig } = require('centig');

process.env.NODE_ENV = 'development';

const config = centig({
  port: {
    type: Number,
    value: 8000,
  },
  env: {
    type: String,
    env: 'NODE_ENV',
    validate: value => {
      if (!['development', 'stage', 'production'].includes(value)) {
        throw Error(`${value} must be development, stage or production`);
      }
    },
  },
});

const port = config.get('port');
const env = config.get('env');

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World');
  })
  .listen(port, () => {
    console.log(`server running on port ${port}. Environment: ${env}`);
  });
