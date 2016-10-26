var pkg = require('./package.json')
var webpack = require('webpack')

module.exports = {
  entry: './libs/index',
  output: {
    path: './dist',
    filename: 'connect.js',
    library: 'chromeConnect',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.BannerPlugin(
      'connect.js v' + pkg.version + '\n' +
      '' + pkg.homepage + '\n' +
      'Copyright 2015 ' + pkg.author + '\n' +
      'Licensed under ' + pkg.license, { entryOnly: true })
  ]
}
