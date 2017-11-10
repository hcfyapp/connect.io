const path = require('path')
const fs = require('fs-extra')
const config = require('./config')

// 清空输出目录
fs.emptyDirSync(path.resolve(__dirname, '../dist'))

// 编译 js
const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const uglifyJS = require('uglify-js')

rollup
  .rollup({
    input: config.input,
    plugins: [config.tp],
    external: ['tinyemitter', 'tslib']
  })
  .then(bundle => {
    // 输出 es 格式
    bundle.write({
      file: config.esOutputPath,
      format: 'es',
      banner: config.banner
    })

    // 输出 cjs 格式
    bundle.write({
      file: config.cjsOutputPath,
      format: 'cjs',
      banner: config.banner
    })
  })

rollup
  .rollup({
    input: config.input,
    plugins: [nodeResolve(), commonjs(), config.tp]
  })
  .then(bundle => {
    // 输出 umd 格式
    bundle
      .generate({
        format: 'umd',
        name: config.name,
        banner: config.banner
      })
      .then(({ code }) => {
        fs.writeFile(config.umdOutputPath, code)
        fs.writeFile(
          config.umdMinOutputPath,
          uglifyJS.minify(code, { output: { comments: /^!/ } }).code
        )
      })
  })
