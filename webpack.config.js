const pkg = require( './package.json' );
const webpack = require( 'webpack' );

module.exports = {
  entry : './libs/index' ,
  output : {
    path : './dist' ,
    filename : 'connect.js' ,
    library : 'ChromeConnect' ,
    libraryTarget : 'umd'
  } ,
  module : {
    loaders : [
      {
        test : /\.js$/ ,
        exclude : [ /node_modules(?!(\/|\\?\\)(chrome\-env)\1)/ ] ,
        loader : 'babel' ,
        query : {
          presets : [ 'es2015' ] ,
          plugins : [ 'transform-runtime' ]
        }
      }
    ]
  } ,
  plugins : [
    new webpack.BannerPlugin(
      'connect.js v' + pkg.version + '\n' +
      '' + pkg.homepage + '\n' +
      'Copyright 2015 ' + pkg.author + '\n' +
      'Licensed under ' + pkg.license , { entryOnly : true } )
  ] ,
  watch : true
};
