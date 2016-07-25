const path = require('path'),
  webpack = require('webpack'),
  c = require('./webpack.config.js')

const testSource = path.resolve('./libs/')

c.entry = {} // 清空 entry
c.devtool = '#inline-source-map'

const babelLoaderConfig = c.module.loaders.shift()
babelLoaderConfig.include.shift()

c.isparta = {
  embedSource: true,
  noAutoWrap: true
}

c.module.preLoaders = [
  babelLoaderConfig,
  {
    test: /\.js$/,
    include: testSource,
    loader: 'isparta-loader'
  }
]

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'tests/index.js'
    ],
    preprocessors: {
      'tests/index.js': ['webpack']
    },
    webpack: c,
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        {
          type: 'html',
          subdir (browser) {
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
  })
}
