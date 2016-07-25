const pkg = require('./package.json')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: './libs/index',
  output: {
    path: './dist',
    filename: 'connect.js',
    library: 'ChromeConnect',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, './libs'),
          path.resolve(__dirname, './tests'),
          path.resolve(__dirname, './node_modules/chrome-env')
        ],
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(
      'connect.js v' + pkg.version + '\n' +
      '' + pkg.homepage + '\n' +
      'Copyright 2015 ' + pkg.author + '\n' +
      'Licensed under ' + pkg.license, { entryOnly: true })
  ]
};
