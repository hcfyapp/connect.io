# connect.io

[chrome.runtime.connect](https://developer.chrome.com/extensions/runtime#method-connect) wrapper that using [Stock.IO API](http://socket.io/docs/).

## Install

```
npm i connect.io connect.io-client
```

## Usage

Client(somewhere.html)：

```html
<script src="node_modules/connect.io-client/dist/client.js"></script>
<script>
const client = new ChromeClient('extensions id');
client.on('welcome',(msg) => {
console.log(msg); // 'hello world'
});

client.emit('report clients number', 'some arguments', (number) => {
  console.log(number); // 100
});
</script>
```

background.html：

```html
<script src="node_modules/connect.io/dist/server.js"></script>
<script>
const server = new ChromeServer();
server.on('connect',(connection)=> {

  // Only send message to this connection client.
  connection.emit('welcome','hello world');

  // Sending a message to everyone else except for the connection that starts it.
  connection.broadcast('join','new client joined.');

  // Sending acknowledgements
  connection.on('report clients number',(data, sendResponse) => {
    console.log(data); // 'some arguments'
    sendResponse(100);
  });

  connection.on('disconect', () => {
    // Sending messge to every connection.
    server.emit('Someone out');
  });
});
</script>
```
