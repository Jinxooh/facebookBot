require('babel-register')({
  presets: [['latest', { option: 'react' }]],
  plugins: ['transform-class-properties'],
});
require('babel-polyfill');
require('../app');
