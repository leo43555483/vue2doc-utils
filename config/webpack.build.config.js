const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const path = require('path');

const TransformSFC = require('../lib/plugins/TransformSFC');

const webpackConfig = (config) => ({
  target: 'web',
  devtool: 'none',
  mode: 'production',
  stats: {
    loggingDebug: [(name) => name.contains('TransformSFC')],
  },
  entry: {},
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  resolveLoader: {
    modules: [path.join(process.cwd(), './node_modules')],
  },
  resolve: {
    symlinks: false,
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              productionMode: true,
              compilerOptions: {
                preserveWhitespace: false,
              },
            },
          },
        ],
      },
      {
        test: /\.(js|jsx?)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              sourceMap: true,
            },
          },
          // {
          //   loader: require.resolve('../src/loader.js'),
          // },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]',
        },
      },
    ],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new ProgressBarPlugin(),
    new VueLoaderPlugin(),
    new FriendlyErrorsPlugin(),
    new TransformSFC(config),
  ],
});

module.exports = function getWebpackConfig(entry, output, config) {
  return {
    ...webpackConfig(config),
    entry: {
      ...webpackConfig.entry,
      ...entry,
    },
    output: {
      ...webpackConfig.output,
      ...output,
    },
  };
};
