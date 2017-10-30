const path = require('path')
const fs = require('fs-extra')

// 清空输出目录
fs.emptyDirSync(path.resolve(__dirname, '../dist'))

// 编译 js
const rollup = require('rollup')
const node = require('rollup-plugin-node-resolve')
const cjs = require('rollup-plugin-commonjs')
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

rollup
  .rollup({
    input: path.resolve(__dirname, '../libs/index.js'),
    plugins: [node(), cjs(), buble()]
  })
  .then(bundle => {
    // 输出 umd 格式
    bundle
      .generate({
        format: 'umd',
        name: 'chromeConnect',
        globals: {
          'tiny-emitter': 'TinyEmitter'
        },
        banner
      })
      .then(({ code }) => {
        fs.writeFile(path.resolve(__dirname, '../dist/chrome-connect.js'), code)
        fs.writeFile(
          path.resolve(__dirname, '../dist/chrome-connect.min.js'),
          uglifyJS.minify(code, { output: { comments: /^!/ } }).code
        )
      })

    // 输出 es 格式
    bundle.write({
      file: path.resolve(__dirname, '../dist/chrome-connect.esm.js'),
      format: 'es',
      banner
    })

    // 输出 cjs 格式
    bundle.write({
      file: path.resolve(__dirname, '../dist/chrome-connect.common.js'),
      format: 'cjs',
      banner
    })
  })
