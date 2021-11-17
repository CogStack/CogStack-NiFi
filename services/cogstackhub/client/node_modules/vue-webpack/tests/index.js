const test = require('ava');
const {build} = require('../src');

test('build', async (t) => {
  let config = build({
    inputFilePath: './assets/entry.js',
    outputPath: '../dist'
  });
  t.is(config.target, 'web');
  t.is(config.devtool, '#eval-source-map');
  t.is(config.module.rules.length, 5);
  t.is(config.entry.length, 3);
  t.is(config.output.filename, 'bundle.js?[hash]');
  t.is(config.output.publicPath, '/');
  t.is(config.output.libraryTarget, 'var');
  t.is(config.plugins.length, 6);
});
