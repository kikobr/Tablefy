const webpack = require('webpack');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const path = require('path')

var cacheObj = {};

module.exports = (env, argv) => ({

  // mode: argv.mode === 'production' ? 'production' : 'development',
  mode: "development",

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui.ts', // The entry point for your UI code
    code: './src/code.ts', // The entry point for your plugin code
  },

  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      { test: /\.tsx?$/, exclude: /node_modules/, use: [
        {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
      ]},

      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      { test: /\.css$/, use: ['style-loader', { loader: 'css-loader' }] },

      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      { test: /\.(png|jpg|gif|webp|svg)$/, loader: 'url-loader' },
    ],
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js', '.css'] },

  output: {
    publicPath: '',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/'), // Compile into a folder called "dist"
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new webpack.DefinePlugin({
      'global': {}, // Fix missing symbol error when running in developer VM
    }),
    // new HtmlWebpackExternalsPlugin({
    //   externals: [
    //     {
    //       module: 'papaparse',
    //       entry: 'papaparse.min.js',
    //       global: 'Papa',
    //     },
    //   ],
    //   files: ['ui.html'],
    // }),
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inject: "body",
      cache: false,
      // inlineSource: '.(js|css)$',
      chunks: ['ui'],
    }),
    new ScriptExtHtmlWebpackPlugin({
        inline: ['ui.js'],
    })
    // new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
  ],
})
