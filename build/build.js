const path = require('path')
const fs = require('fs-extra')

// 清空输出目录
fs.emptyDirSync(path.resolve(__dirname, '../dist'))

// 编译 js
const rollup = require('rollup')
const buble = require('rollup-plugin-buble')
const uglifyJS = require('uglify-js')
const pkg = require('../package.json')

const banner = [
  '/*!',
  ' * chrome-connect v' + pkg.version,
  ' * https://github.com/Selection-Translator/connect.io',
  ' * Released under the MIT License.',
  ' */'
].join('\n')

rollup.rollup({
  entry: path.resolve(__dirname, '../libs/index.js'),
  external: ['tiny-emitter'],
  plugins: [buble()]
}).then(bundle => {
  // 输出 umd 格式
  const { code } = bundle.generate({
    format: 'umd',
    moduleName: 'chromeConnect',
    globals: {
      'tiny-emitter': 'TinyEmitter'
    },
    banner
  })

  fs.writeFile(path.resolve(__dirname, '../dist/chrome-connect.js'), code)
  fs.writeFile(path.resolve(__dirname, '../dist/chrome-connect.min.js'), uglifyJS.minify(code, { output: { comments: /^!/ } }).code)

  // 输出 es 格式
  bundle.write({
    dest: path.resolve(__dirname, '../dist/chrome-connect.esm.js'),
    format: 'es',
    banner
  })

  // 输出 cjs 格式
  bundle.write({
    dest: path.resolve(__dirname, '../dist/chrome-connect.common.js'),
    format: 'cjs',
    banner
  })
})
