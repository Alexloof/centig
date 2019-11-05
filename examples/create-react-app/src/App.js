import React from 'react';
import './App.css';
import centig from 'centig';

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

console.log('process env', process.env);

console.log(config.get('port'));
console.log(config.get('env'));

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
