module.exports = function(config) {
  const options = {
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      'node_modules/es6-promise/dist/es6-promise.js',
      'node_modules/chrome-env/dist/chrome.js',
      'src/**/*.ts',
      'tests/**/*.ts'
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    reporters: ['progress', 'karma-typescript'],
    karmaTypescriptConfig: {
      compilerOptions: {
        declaration: false
      },
      coverageOptions: {
        exclude: /\.(d|spec|helper)\.ts/i
      }
    },
    browsers: ['PhantomJS'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO
  }

  if (process.env.TRAVIS) {
    options.singleRun = true
    options.autoWatch = false
    options.reporters.push('dots')
    options.karmaTypescriptConfig.reports = {
      lcovonly: {
        dir: 'coverage',
        subdirectory: 'lcov'
      }
    }
  } else {
    options.browsers.push('Chrome', 'Safari')
    // Safari 有点慢
    options.captureTimeout = 120000
    options.browserNoActivityTimeout = 20000
  }

  config.set(options)
}
