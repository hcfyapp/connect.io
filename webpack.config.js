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
        exclude : /node_modules/ ,
        loader : 'babel' ,
        query : {
          presets : [ 'es2015' ] ,
          plugins : [ 'transform-runtime' ]
        }
      }
    ]
  } ,
  watch : true ,
  devtool : '#source-map'
};
