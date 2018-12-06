const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	mode: process.env.NODE_ENV || 'production',
	target: 'node',
	node: {
		__filename: true,
		__dirname: true
	},
	externals: [nodeExternals()],
	plugins: [
		new NodemonPlugin()
	],
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
	}
};
