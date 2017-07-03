# connect.io

[![Build Status](https://img.shields.io/travis/Selection-Translator/connect.io/master.svg?style=flat-square)](https://travis-ci.org/Selection-Translator/connect.io)
[![Coverage Status](https://img.shields.io/coveralls/Selection-Translator/connect.io/master.svg?style=flat-square)](https://coveralls.io/github/Selection-Translator/connect.io?branch=master)
[![dependencies Status](https://img.shields.io/david/Selection-Translator/connect.io.svg?style=flat-square)](https://david-dm.org/Selection-Translator/connect.io)
[![devDependencies Status](https://img.shields.io/david/dev/Selection-Translator/connect.io.svg?style=flat-square)](https://david-dm.org/Selection-Translator/connect.io?type=dev)
[![NPM Version](https://img.shields.io/npm/v/connect.io.svg?style=flat-square)](https://www.npmjs.com/package/connect.io)

Real-time bidirectional event-based and Promise friendly communication in Chrome extensions/apps inspired by [Socket.IO](http://socket.io/).

## Install

### Use with Webpack

If you build your project with Webpack, you can install connect.io via npm:

```
npm install connect.io
```

Then you can import it in your project:

```js
// es6
import { createClient, createServer, send } from 'connect.io'

// commonjs
const { createClient, createServer, send } = require('connect.io')
```

### Use with &lt;script&gt;

Download chrome-connect.js from [unpkg](https://unpkg.com/connect.io/dist/chrome-connect.js)([min version](https://unpkg.com/connect.io/dist/chrome-connect.min.js)).

Then reference it in your html:

```html
<script src="path/to/chrome-connect.js"></script>
<!-- now you will get a global variable named chromeConnect -->
<script>
 var createClient = chromeConnect.createClient
 var createServer = chromeConnect.createServer
 var send = chromeConnect.send
</script>
```

## Usage

### Send message from content script to background

First, create a server in background page(or other pages like popup, options):

```js
import { createServer } from 'connect.io'

const server = createServer()
```

Second, listen `connect` event on server:

```js
server.on('connect', client => {
  // client is a Client object
})
```

Finally, create a client in content script:

```js
import { createClient } from 'connect.io'

// client is an Client object
const client = createClient()
```

For more information about the `Client` object please read the API below.

### Send message from background to content script

Only different with the above steps is: when you create client in background, you must specify the tab id in `createClient`.

For example, in your background:

```js
import { createClient } from 'connect.io'

const clientInBackground = createClient(1001) // the tab id you want to connect
```

### Using namespace

Server can optional has a namespace:

```js
import { createServer } from 'connect.io'

const serverTweets = createServer('tweets')

serverTweets.on('connect', client => {
  client.on('tweet', tween => {
    postTweet(tween)
  })
})

const serverNotification = createServer('notification')

serverNotification.on('connect', client => {
  client.on('notice', () => {
    showNotification()
  })
})
```

You can connect to different server in client:

```js
import { createClient } from 'connect.io'

const clientTweets = createClient({
  namespace: 'tweets'
})

clientTweets.send('tweet', 'connect.io is awesome')

const clientNotification = createClient({
  namespace: 'notification'
})

clientNotification.send('notice')
```

### Get response from server

You can send response from server to the client. For example:

```js
// in server
import { createServer } from 'connect.io'

const server = createServer()

server.on('connect', client => {
  client.on('Do I have enough money?', (data, resolve, reject) => {
    if (data > 100) {
      resolve('Yes you do.')
    } else {
      reject('You need more money.')
    }
  })
})
```

```js
// in client
import { createClient } from 'connect.io'

const client = createClient()

// pass true as the last params to get response
client.send('Do I have enough money?', 50, true).catch(msg => {
  console.log(msg) // 'You need more money.'
})

client.send('Do I have enough money?', 10000, true).then(msg => {
  console.log(msg) // 'Yes you do.'
})
```

### Send one-time message

If you want to send one-time message and don't want to create a client, you can use `send` method:

```js
import { send } from 'connect.io'

send({
  name: 'Do I have enough money?',
  data: 10000,
  needResponse: true
}).then(msg => {
  console.log(msg) // 'Yes you do.'
})
```

## API

### createServer([namespace])

Return a `Server` object.

Note: same namespace get the same `Server` object.

```js
import { createServer } from 'connect.io'

createServer() === createServer() // true
createServer('namespace') === createServer('namespace') // true
createServer('foo') === createServer('bar') // false
```

### Server

Create from `createServer` method.

#### Server#send(name[, data])

Send message to all clients that connect to this server.

#### Server#on(event, handler)

Listen event. For now there is only one event: `connect`.

### createClient([id, options])

Return a `Client` object.

If you want to connect to content script from background, then `id` is necessary and must be a tab id.

`options` has these property:

 - `namespace`: which server you want connect
 - `frameId`: if you are connect to content script from background, you can specify a [frameId](https://developer.chrome.com/extensions/runtime#property-MessageSender-frameId) to connect only this frame.

### Client

Create from `createClient`, or provided in `server.on('connect')` event.

#### Client#port

The native chrome [Port](https://developer.chrome.com/extensions/runtime#type-Port) object.

#### Client#external

If this client is connect from webpage or other extension, then this property is `true`.

#### Client#send(name[, data, needResponse])

Send message to server or client.

#### Client#on(name, handler(data, resolve, reject))

Receive message from server or client. Use `resolve` or `reject` method to response this message to server or client.

#### Client#broadcast(name[, data])

Note: this method only exist in server.

Sending a message to everyone else except for the connection that starts it.

#### Client#disconnect()

Disconnect the connection.

### send(options)

Send one-time message.

The `options` has these property:

 - `id`: optional. If you want to connect to content script from background, then `id` is necessary and must be a tab id.
 - `frameId`: optional. See `createClient([id, options])` API.
 - `namespace`: optional. See `createClient([id, options])` API.
 - `name`: the message name.
 - `data`: the data you want send.
 - `needResponse`: if you need response, then set this to `true`

## License

MIT
