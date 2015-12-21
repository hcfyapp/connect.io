window.chrome = {
  runtime : {
    id : 'xx' ,
    onConnect : { addListener() {} } ,
    connect() {
      return {
        disconnect() {} ,
        onMessage : { addListener() {} } ,
        onDisconnect : { addListener() {} } ,
        postMessage() {}
      };
    }
  }
};
