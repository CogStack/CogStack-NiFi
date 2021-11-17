const webpack = require("webpack");
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ManifestPlugin = require('webpack-manifest-plugin');
const InlineEnviromentVariablesPlugin = require('inline-environment-variables-webpack-plugin');
const cssNext = require('postcss-cssnext');

/*
* Returns a modules object.
*/

function getModules() {
  let rules = [
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        postcss: [
          cssNext()
        ],
        loaders: {
          css: ExtractTextPlugin.extract({
            loader: `css-loader`,
            fallbackLoader: 'vue-style-loader'
          })
        }
      }
    },
    {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    },
    {
      test: /\.json$/,
      loader: 'json-loader'
    },
    {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'file-loader',
      options: {
        name: `[path][name].[ext]?[hash]`
      }
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'file-loader',
      query: {
        name: `[path][name].[ext]?[hash]`
      }
    }
  ];

  return {rules};
}

/*
* Returns an entry object.
*/

function getEntry({inputFilePath, hotReload}) {
  let paths = [
    'babel-polyfill',
    path.resolve(inputFilePath)
  ];

  if (hotReload) {
    paths.push(`webpack-hot-middleware/client?path=/__webpack_hmr`)
  }

  return paths;
}

/*
* Returns an output object.
*/

function getOutput({isServer, outputPath, outputFileName, publicPath}={}) {
  let fileName = outputFileName.indexOf(".") !== -1
    ? outputFileName.substr(0, outputFileName.lastIndexOf("."))
    : outputFileName;

  return {
    path: path.resolve(outputPath),
    filename: `${fileName}.js?[hash]`,
    publicPath,
    libraryTarget: isServer ? 'commonjs2' : 'var'
  };
}

/*
* Returns a plugins object.
*/

function getPlugins({env, mode, manifest, splitStyle, uglify, minify, hotReload, outputFileName, inputFilePath}={}) {
  let isDev = env.toLowerCase() === 'development';

  let fileName = outputFileName.indexOf(".") !== -1
    ? outputFileName.substr(0, outputFileName.lastIndexOf("."))
    : outputFileName;

  let plugins = [
    new InlineEnviromentVariablesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.VUE_ENV': JSON.stringify(mode)
    })
  ];

  if (manifest) {
    plugins.push(
      new ManifestPlugin({fileName: `${fileName}.json`})
    );
  }

  if (splitStyle) {
    plugins.push(
      new ExtractTextPlugin(`${fileName}.css?[hash]`)
    );
  }

  if (uglify) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {warnings: false}
      })
    );
  }

  if (minify) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    );
  }

  if (hotReload) {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    );
  }

  if (!isDev) {
    plugins.push(
      new webpack.optimize.DedupePlugin()
    );
  }

  return plugins;
}

/*
* Builds and returns a Webpack configuration object.
*/

exports.build = function ({
  inputRootPath=null,
  inputFilePath,
  env='development',
  hotReload,
  manifest=true,
  minify,
  mode='client',
  outputFileName='bundle',
  outputPath='./dist',
  publicPath='/',
  splitStyle=true,
  uglify
}={}) {
  if (!inputFilePath) throw new Error('inputFilePath is a required option')

  const isDev = env.toLowerCase() === 'development';
  const isServer = mode.toLowerCase() === 'server';

  if (isDev) {
    if (typeof hotReload === 'undefined') hotReload = true;
    if (typeof uglifyJs === 'undefined') uglify = false;
    if (typeof minify === 'undefined') minify = false;
  }
  else {
    hotReload = false;
    if (typeof uglify === 'undefined') uglify = true;
    if (typeof minify === 'undefined') minify = true;
  }

  if (isServer) {
    hotReload = false;
  }

  if (!inputRootPath) {
    inputRootPath = path.dirname(inputFilePath);
  }

  return {
    context: path.resolve(inputRootPath),
    target: isServer ? 'node' : 'web',
    devtool: !isServer && isDev ? '#eval-source-map' : false,
    module: getModules(),
    entry: getEntry({inputFilePath, hotReload}),
    output: getOutput({isServer, outputPath, outputFileName, publicPath}),
    plugins: getPlugins({env, mode, manifest, splitStyle, uglify, minify, hotReload, outputFileName})
  };
}
