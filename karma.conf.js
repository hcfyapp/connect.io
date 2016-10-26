var path = require('path')
var c = require('./webpack.config.js')

c.entry = {} // 清空 entry
c.devtool = '#inline-source-map'

var testSource = path.resolve('./libs/')
var babelLoaderConfig = c.module.loaders.shift()

// 必须告诉 isparta 我使用了哪些 babel 设置，见 https://github.com/deepsweet/isparta-loader/issues/10
c.isparta = {
  embedSource: true,
  noAutoWrap: true,
  babel: babelLoaderConfig.query
}

c.module.preLoaders = [
  babelLoaderConfig,
  {
    test: /\.js$/,
    include: testSource,
    loader: 'isparta'
  }
]

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: ['tests/index.js'],
    preprocessors: {
      'tests/index.js': ['webpack', 'sourcemap']
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
