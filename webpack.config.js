const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
	name: 'server',
	mode: process.env.NODE_ENV || 'production',
	entry: './src/app.js',
	target: 'node',
	node: {
		__filename: true,
		__dirname: true
	},
	output: {
		libraryExport: 'default',
		libraryTarget: 'umd'
	},
	externals: [nodeExternals()],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					keep_fnames: true
				}
			})
		]
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					'babel-loader',
					'eslint-loader'
				]
			}
		]
	},
	plugins: [
		new NodemonPlugin({
			script: './index.js'
		})
	]
};
