const path = require('path')

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/')
      }
    }
  },
  'transpileDependencies': [
    'vuetify'
  ],
  publicPath: '',
  outputDir: './dist'
}
