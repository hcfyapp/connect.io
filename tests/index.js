import 'chrome-env'
import './libs/client-spec'
import './libs/port-spec'
import './libs/send-spec'
import './libs/server-spec'
import './libs/uuid-spec'

// phantomjs 里没有 Promise
ES6Promise.polyfill()
