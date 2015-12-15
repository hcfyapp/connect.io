module.exports = {
  entry : './libs/server' ,
  output : {
    path : './dist' ,
    filename : 'server.js' ,
    library : 'ChromeServer' ,
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
          plugins : [ 'add-module-exports' , 'transform-runtime' ]
        }
      }
    ]
  } ,
  watch : true ,
  devtool : '#source-map'
};
