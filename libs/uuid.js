/**
 * 原本我使用 node-uuid 生成 id，但是为此文件增加了 150KB，因为 babel 把 window.crypto 的 polyfill 加入了文件中；
 * 后来我想到客户端和服务端都运行在同一个浏览器中，所以可以用时间戳 + 随机数来做唯一 ID。
 */
export default ()=> String( Date.now() ) + String( Math.random() );
