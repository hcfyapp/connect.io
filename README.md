# connect.io

Real-time bidirectional event-based communication in Chrome extensions or Apps inspired by [Socket.IO](http://socket.io/).

## Install

```
npm i -S connect.io
```

## Usage

background.html：

```html
<script src="node_modules/connect.io/dist/connect.js"></script>
<script>
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

  // I recommend you use 1 to instead of true:
  client.send('use 1 to instead of true',1);

  // and in Server:
  //server.on('use 1 to instead of true',(data)=>{
  //  console.log(data); // 1
  //  if(data) {
  //    //...
  //  }
  //});


  // Sending a message to everyone else except for the connection that starts it.
  client.broadcast('join','new client joined.');

  // Sending response to client
  client.on('report clients number', (data, sendResponse) => {
    sendResponse(null ,server.ports.length);
  });

  // handle connection disconnect on Server
  client.once('disconnect', isOtherSide => {
    // Sending messge to every connection.
    server.send(isOtherSide ? 'Someone out by himself.' : 'I knock it out.');
  });
});
</script>
```

Client(content-scripts.html)：

```html
<script src="node_modules/connect.io/dist/connect.js"></script>
<script>
const client = new ChromeConnect.Client('optional extensions or apps id or tabId, default value is chrome.runtime.id');

client.on('welcome',(data,sendResponse) => {
  console.log(data); // 'hello world'
  // if you want, you can send a response to Server.
  sendResponse( null, 'Thanks!' );
  // or you can send an error as a rejection.
  sendResponse('I\'m not happy.');
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

client.on('Someone out',()=>{
  // ...
});

// handle connection disconnect on Client
client.once('disconnect', isOtherSide => {
  console.log('Connection disconnected by ', isOtherSide ? 'the other side' : 'myself', '.');
});

// disconnect the connection.
client.disconnect();
</script>
```
