const path = require('path');

  module.exports = {
    entry: './src/index.ts',
    mode: 'production',
   devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript']
            }
          },
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };