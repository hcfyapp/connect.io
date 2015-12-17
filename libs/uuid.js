/**
 * 原本我使用 node-uuid 生成 id，但是为此文件增加了 150KB，因为 babel 把 window.crypto 的 polyfill 加入了最终文件中；
 * 后来我想到客户端和服务端都运行在同一个浏览器中，所以可以用时间戳来做唯一 ID。就算用户频繁的更改系统时间，
 * 那也不至于能刚好命中同一个时间戳吧！
 */
export default ()=> Date.now();
