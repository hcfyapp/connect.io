const path = require('path')
const typescript = require('rollup-plugin-typescript2')
const pkg = require('../package.json')

module.exports = {
  input: path.resolve(__dirname, '../src/index.ts'),
  name: 'chromeConnect',
  tp: typescript({
    useTsconfigDeclarationDir: true
  }),
  esOutputPath: path.resolve(__dirname, '../dist/chrome-connect.esm.js'),
  cjsOutputPath: path.resolve(__dirname, '../dist/chrome-connect.common.js'),
  umdOutputPath: path.resolve(__dirname, '../dist/chrome-connect.js'),
  umdMinOutputPath: path.resolve(__dirname, '../dist/chrome-connect.min.js'),
  banner: [
    '/*!',
    ' * chrome-connect v' + pkg.version,
    ' * https://github.com/Selection-Translator/connect.io',
    ' * Released under the MIT License.',
    ' */'
  ].join('\n')
}
