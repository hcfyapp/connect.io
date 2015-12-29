require( 'babel-polyfill' );
require( 'chrome-env' );

// require all `./tests/libs/**/*spec.js`
const testsContext = require.context( './libs/' , true , /spec\.js$/ );

testsContext.keys().forEach( testsContext );

// require all `./src/**/*.js`
const componentsContext = require.context( '../libs/' , true , /\.js$/ );

componentsContext.keys().forEach( componentsContext );
