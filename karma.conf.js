module.exports = function(config) {
  const c = {
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/es6-promise/dist/es6-promise.js',
      'node_modules/tiny-emitter/dist/tinyemitter.js',
      'node_modules/chrome-env/dist/chrome.js',
      'tests/index.js'
    ],
    preprocessors: {
      'tests/index.js': ['rollup']
    },
    reporters: ['progress', 'coverage'],
    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-istanbul')({
          exclude: ['tests/**/*.js']
        }),
        require('rollup-plugin-buble')()
      ],
      external: ['tiny-emitter', 'chrome-env'],
      globals: {
        'tiny-emitter': 'TinyEmitter'
      },
      format: 'iife',
      name: 'chromeConnect',
      sourcemap: 'inline'
    },
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        {
          type: 'html',
          subdir(browser) {
            return 'html/' + browser.toLowerCase().split(/[ /-]/)[0]
          }
        },
        {
          type: 'lcov',
          subdir: 'lcov'
        }
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome', 'PhantomJS'],
    singleRun: true
  }

  if (process.env.TRAVIS) {
    c.reporters.push('coveralls')
    c.browsers = ['PhantomJS']
  }

  config.set(c)
}
