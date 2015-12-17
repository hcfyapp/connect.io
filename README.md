# connect.io

 Real-time bidirectional event-based communication in Chrome extensions or Apps inspired by [Socket.IO](http://socket.io/).

## Install

```
npm i -S connect.io
```

## Usage

Client(content-scripts.html)：

```html
<script src="node_modules/connect.io/dist/connect.js"></script>
<script>
const client = new ChromeConnect.Client('optional extensions or apps id or tabId, default value is chrome.runtime.id');
client.on('welcome',(msg) => {
  console.log(msg); // 'hello world'
});

// get message acknowledgements
client.send('report clients number', (number, error) => {

  // When connection has been disconnected until get response, then error will be a string.
  // It's often happened when you connect to a tab from extension but you don't have permission. (etc chrome:// 、chrome-extension://)
  if( error ) {
    throw new Error(error);
  }

  console.log(number); // 100
});
</script>
```

background.html：

```html
<script src="node_modules/connect.io/dist/connect.js"></script>
<script>
const server = new ChromeConnect.Server();
server.on('connect',(client)=> {

  if (client.exteranl && client.port.sender.url === blackList) {
    client.disconnect();
    return;
  }

  // Only send message to this connection client.
  client.send('welcome','hello world');

  // Sending a message to everyone else except for the connection that starts it.
  client.broadcast('join','new client joined.');

  // Sending acknowledgements
  client.on('report clients number', (data, sendResponse) => {
    console.log(data); // when no data send to server, the data argument will be undefined
    sendResponse(100);
  });

  client.on('disconect', () => {
    // Sending messge to every connection.
    server.send('Someone out');
  });

});
</script>
```
