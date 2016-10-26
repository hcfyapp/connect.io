require('chrome-env')

// phantomjs 里没有 Promise
var ES6Promise = require('es6-promise')
ES6Promise.polyfill()

// require all `../libs/**/*.js`
const libsContext = require.context('../libs/', true, /\.js/)
libsContext.keys().forEach(libsContext)

// require all `./tests/libs/**/*spec.js`
var testsContext = require.context('./libs/', true, /spec\.js$/)
testsContext.keys().forEach(testsContext)
