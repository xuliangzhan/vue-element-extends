const path = require('path')

function resolve (dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-element-extends/' : '/',
  outputDir: 'docs',
  productionSourceMap: false,
  configureWebpack: {
    performance: {
      hints: false
    }
  },
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  chainWebpack (config) {
    config.resolve.alias
      .set('@', resolve('examples'))
    config.output
      .set('libraryExport', 'default')
      .set('library', 'VueElementExtends')
    // if (process.env.NODE_ENV === 'production') {
    //   let XEUtils = {
    //     root: 'XEUtils',
    //     commonjs: 'xe-utils',
    //     commonjs2: 'xe-utils',
    //     amd: 'xe-utils'
    //   }
    //   if (config.has('externals')) {
    //     config.externals
    //       .set('xe-utils', XEUtils)
    //   } else {
    //     config
    //       .set('externals', {
    //         'xe-utils': XEUtils
    //       })
    //   }
    // }
  }
}
