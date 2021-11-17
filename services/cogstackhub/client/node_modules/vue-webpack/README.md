# [vue](http://vuejs.org)-[webpack](https://webpack.github.io)

> Webpack configuration object generator for Vue.js.

**DEPRECATED WARNING: This package is not maintained any more since it's difficult to say what configuration is right for every Vue.js project. See the [vue-example](https://github.com/xpepermint/vue-example/) on how to setup your Vue.js project.**

<img src="logo.png" height="60" style="margin-bottom: 20px" />

[Webpack](https://webpack.github.io) is one of the leading module bundlers these days, but many developers still find the setup to be very complicated. [Vue.js](http://vuejs.org) on the other hand is simple, but probably the hardest part represents the [Webpack](https://webpack.github.io) configuration.

This package provides an easy way to generate a Webpack configuration object.

This is an open source package for [Vue.js](http://vuejs.org/). The source code is available on [GitHub](https://github.com/xpepermint/vue-webpack) where you can also find our [issue tracker](https://github.com/xpepermint/vue-webpack/issues).

## Related Projects

* [vue-builder](https://github.com/xpepermint/vue-builder): Server-side and client-side rendering for Vue.js.
* [express-vue-builder](https://github.com/xpepermint/express-vue-builder): Vue.js server-side rendering middleware for Express.js.
* [express-vue-dev](https://github.com/xpepermint/express-vue-dev): Vue.js development server middleware for Express.js.
* [koa-vue-builder](https://github.com/kristianmandrup/koa-vue-builder): Vue.js server-side rendering middleware for Koa.js.
* [koa-vue-dev](https://github.com/kristianmandrup/koa-vue-dev): Vue.js development server middleware for Koa.js.
* [vue-cli-template](https://github.com/xpepermint/vue-cli-template): A simple server-side rendering CLI template for Vue.js.

## Install

Run the command below to install the package with all required peer dependencies.

```
$ npm install --save-dev babel-core babel-loader babel-polyfill babel-preset-es2015 css-loader extract-text-webpack-plugin@2.0.0-beta.4 inline-environment-variables-webpack-plugin file-loader postcss-cssnext vue-loader webpack@2.1.0-beta.27 webpack-hot-middleware webpack-manifest-plugin
$ npm install --save-dev vue-webpack
```

Create a new file `./.babelrc` and configure the presets.

```js
{
  "presets": [
    "es2015"
  ]
}
```

## Usage

```js
import {build} from 'vue-webpack';

const config = build({
  env: 'development',
  mode: 'server',
  inputFilePath: './src/client/server-entry.js',
  outputFileName: 'bundle',
  outputPath: './dist'
}); // -> Webpack configuration object suitable for rendering Vue.js applications.
```

## API

**build(options)**:Object

> Builds and returns a Webpack configuration object.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| inputFilePath | String | Yes | - | The path to Vue.js entry file (make sure that you set the right entry file based on `mode`).
| inputRootPath | String | No | `inputFilePath` folder | The path to the Vue.js application's root directory.
| env | String | No | development | The environment name (use `deveoplent` or `production`). This value can also be set through the `process.env.NODE_ENV` environment variable.
| hotReload | Boolean | No | true when `env=development`, otherwise always false | If set to `true` then Webpack's hot-reload function is included.
| manifest | Boolean | No | false | When set tot `true`, the manifest files is created.
| minify | Boolean | No | false when `env=development`, otherwise true | If set to `true` then CSS code is minified.
| mode | String | No | client | Vue.js application mode (use `server` or `client`). This value can also be set through the `process.env.VUE_ENV` environment variable.
| outputFileName | String | No | bundle | The name of the bundle file (e.g. bundle.js).
| outputPath | String | No | ./dist | The path to the output folder.
| publicPath | String | No | / | The public path for the assets (e.g. if set to `/assets` then files are available at http://domain.com/assets). This variable should only be set when building a configuration object for a client.
| splitStyle | Boolean | No | true | When set to `true`, javascript and css code are stored into separated files.
| uglify | Boolean | No | false when `env=development`, otherwise true | If set to `true` then Javascript code is minified.

## License (MIT)

```
Copyright (c) 2016 Kristijan Sedlak <xpepermint@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
