var chrome = window.chrome
var runtime = chrome && chrome.runtime

if (!runtime) throw new Error('You\'re not in Google Chrome.')

module.exports = runtime || null
