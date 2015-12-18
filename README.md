# connect.io

Real-time bidirectional event-based and Promise friendly communication in Chrome extensions or Apps inspired by [Socket.IO](http://socket.io/).

## Install

```
npm i -S connect.io
```

## Usage

background.js：

```js
const server = new ChromeConnect.Server();
server.on('connect',(client)=> {

  if (client.exteranl && client.port.sender.url === YourBlackList) {
    client.disconnect();
    return;
  }

  // Only send message to this connection client.
  // If you want get response, pass "true" as the last argument,
  // then "client.send()" will return a promise.
  // Otherwise, "client.send()" just return undefined.
  client
    .send('welcome','hello world',true)
    .then(
      response => console.log(response), // print "Thanks!"
      error => console.log(error) // print "I'm not happy."
    );

  // Note: if you just want send a "true" to the other side and don't want response,
  // You must do:
  client.send('send true and do not need response',true,false);

  // I recommend you use 1 to instead of true, so you can omit the last argument:
  client.send('use 1 to instead of true',1);

  // then in other side:
  //client.on('use 1 to instead of true',(data)=>{
  //  console.log(data); // 1
  //  if(data) {
  //    //...
  //  }
  //});

  // Sending a message to everyone else except for the connection that starts it.
  client.broadcast('join','new client joined.');

  // Sending response to client
  client.on('report clients number', (data, resolve, reject) => {
    resolve(server.ports.length);
  });

  // handle connection disconnect on Server
  client.once('disconnect', isOtherSide => {
    // Sending messge to every connection.
    server.send(isOtherSide ? 'Someone out by himself.' : 'I knock it out.');
  });
});
```

content-scripts.js：

```js
// sending one-time message
ChromeConnect.Client.send({
  // specify extension or app id. Default value is chrome.runtime.id
  eId:'',

  // or specify tabId if you want connect to content-scripts from extension.
  tabId:23,
  frameId:0, // see https://developer.chrome.com/extensions/tabs#method-connect

  name:'your msg name',
  data:{ your:'data' },
  needResponse:true // if true, send() will return a Promise, otherwise it just return undefined.
}).then(
 // ....
);

// long-lived connections
const client = new ChromeConnect.Client('optional extensions or apps id, or tabId and frameId. default value is chrome.runtime.id');

client.on('welcome',(data,resolve,reject) => {
  console.log(data); // 'hello world'
  // if you want, you can send a response to Server as resolved.
  resolve('Thanks!');
  // or you can send an error as a rejection.
  reject('I\'m not happy.');
});

client.on('join',function(data){
  console.log(data); // "new client joined."
});

// get Server response.
client
  .send('report clients number',true)
  .then(
    res => console.log(res) , // 1
    error => console.log(error)
  );

client.on('Someone out',()=> {
  // ...
});

// handle connection disconnect on Client
client.once('disconnect', isOtherSide => {
  console.log('Connection disconnected by ', isOtherSide ? 'the other side' : 'myself', '.');
});

// disconnect the connection.
client.disconnect();
```
